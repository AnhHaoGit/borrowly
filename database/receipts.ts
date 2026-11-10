import { and, count, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { books, receipts, users } from "@/database/schema";
import { BORROW_LIMIT, PICKUP_WINDOW_DAYS, getPickupDeadline } from "@/lib/receipts";
import type { ActiveBorrowStates, ReceiptWithBook } from "@/types/receipt";
import type { BorrowStatus, TicketWithDetails } from "@/types/ticket";

// Trạng thái "còn đang giữ sách": tính vào giới hạn 10 cuốn và chặn mượn trùng.
// RETURNED/EXPIRED là phiếu đã đóng nên không chặn gì nữa.
export const ACTIVE_STATUSES: BorrowStatus[] = [
  "PENDING",
  "BORROWED",
  "OVERDUE",
];

/**
 * Đồng bộ những trạng thái phụ thuộc thời gian trước khi đọc dữ liệu:
 *  - PENDING quá 2 ngày không đến nhận -> EXPIRED và trả lại số lượng khả dụng;
 *  - BORROWED quá hạn trả -> OVERDUE.
 *
 * Mỗi bước là một statement duy nhất (CTE + UPDATE) nên không có trạng thái nửa
 * vời, và driver HTTP của Neon không cần transaction. Statement đầu chỉ trả lại
 * số lượng cho đúng những phiếu vừa chuyển trạng thái thật sự, nên chạy đồng
 * thời cũng không cộng nhầm tồn kho.
 */
export const sweepReceiptStatuses = async (): Promise<void> => {
  try {
    await db.execute(sql`
      WITH expired AS (
        UPDATE receipts
        SET status = 'EXPIRED'
        WHERE status = 'PENDING'
          AND created_at <= now() - make_interval(days => ${PICKUP_WINDOW_DAYS}::int)
        RETURNING book_id
      ),
      counted AS (
        SELECT book_id, COUNT(*)::int AS total
        FROM expired
        GROUP BY book_id
      )
      UPDATE books
      SET available_quantity = books.available_quantity + counted.total
      FROM counted
      WHERE books.id = counted.book_id
    `);

    await db.execute(sql`
      UPDATE receipts
      SET status = 'OVERDUE'
      WHERE status = 'BORROWED'
        AND due_date IS NOT NULL
        AND due_date < CURRENT_DATE
    `);
  } catch (error) {
    // Đồng bộ trạng thái là việc phụ: lỗi ở đây không được làm hỏng việc đọc.
    console.error("Failed to sync receipt statuses:", error);
  }
};

/**
 * Trạng thái phiếu đang giữ sách của một người, theo bookId — đủ để vẽ nút
 * Borrow đúng ở cả trang danh sách và trang chi tiết. Truyền `bookIds` để chỉ
 * lấy những cuốn đang hiển thị.
 */
export const getActiveBorrowStates = async (
  userId: string,
  bookIds?: string[],
): Promise<ActiveBorrowStates> => {
  if (bookIds && bookIds.length === 0) return {};

  const rows = await db
    .select({ bookId: receipts.bookId, status: receipts.status })
    .from(receipts)
    .where(
      and(
        eq(receipts.userId, userId),
        inArray(receipts.status, ACTIVE_STATUSES),
        ...(bookIds ? [inArray(receipts.bookId, bookIds)] : []),
      ),
    )
    .orderBy(desc(receipts.createdAt));

  // Mới nhất trước: nếu dữ liệu cũ có hai phiếu cho cùng một cuốn thì giữ phiếu mới.
  const states: ActiveBorrowStates = {};

  for (const row of rows) {
    if (!(row.bookId in states)) states[row.bookId] = row.status;
  }

  return states;
};

/** Số cuốn người dùng đang giữ (chưa trả), dùng để áp giới hạn mượn. */
export const countActiveReceipts = async (userId: string): Promise<number> => {
  const [row] = await db
    .select({ total: count() })
    .from(receipts)
    .where(
      and(
        eq(receipts.userId, userId),
        inArray(receipts.status, ACTIVE_STATUSES),
      ),
    );

  return Number(row?.total ?? 0);
};

export type BorrowFailureCode =
  | "NOT_FOUND"
  | "OUT_OF_STOCK"
  | "LIMIT_REACHED"
  | "ALREADY_BORROWED"
  | "FAILED";

export type BorrowOutcome =
  | { ok: true; receiptId: string; pickupDeadline: Date }
  | { ok: false; code: BorrowFailureCode; message: string };

/**
 * Tạo phiếu mượn ở trạng thái PENDING cho một người dùng đã xác thực.
 *
 * Thứ tự kiểm tra: đồng bộ trạng thái -> chặn mượn trùng -> giới hạn 10 cuốn ->
 * trừ tồn kho bằng UPDATE có điều kiện (nguyên tử, nên hai người bấm cùng lúc
 * cho cuối cùng vẫn không âm kho) -> tạo phiếu. Nếu bước cuối lỗi thì hoàn lại
 * đúng một cuốn vừa giữ chỗ.
 */
export const borrowBookForUser = async ({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}): Promise<BorrowOutcome> => {
  await sweepReceiptStatuses();

  const active = await getActiveBorrowStates(userId, [bookId]);

  if (active[bookId]) {
    return {
      ok: false,
      code: "ALREADY_BORROWED",
      message:
        active[bookId] === "PENDING"
          ? "You already have a receipt for this book. Pick it up at the library."
          : "This book is already on your shelf.",
    };
  }

  const activeCount = await countActiveReceipts(userId);

  if (activeCount >= BORROW_LIMIT) {
    return {
      ok: false,
      code: "LIMIT_REACHED",
      message: `You are holding ${BORROW_LIMIT} books. Return one before borrowing another.`,
    };
  }

  const [reserved] = await db
    .update(books)
    .set({ availableQuantity: sql`${books.availableQuantity} - 1` })
    .where(and(eq(books.id, bookId), gt(books.availableQuantity, 0)))
    .returning({ id: books.id });

  if (!reserved) {
    const [book] = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    return book
      ? {
          ok: false,
          code: "OUT_OF_STOCK",
          message: "All copies of this book are currently on loan.",
        }
      : {
          ok: false,
          code: "NOT_FOUND",
          message: "This book is no longer in the library.",
        };
  }

  try {
    const [row] = await db
      .insert(receipts)
      .values({ userId, bookId, status: "PENDING" })
      .returning({ id: receipts.id, createdAt: receipts.createdAt });

    if (!row) throw new Error("Receipt insert returned no row");

    return {
      ok: true,
      receiptId: row.id,
      pickupDeadline: getPickupDeadline(row.createdAt),
    };
  } catch (error) {
    console.error("Failed to create receipt:", error);

    // Trả lại cuốn vừa giữ chỗ để kho không bị trừ vô ích.
    await db
      .update(books)
      .set({ availableQuantity: sql`${books.availableQuantity} + 1` })
      .where(eq(books.id, bookId));

    return {
      ok: false,
      code: "FAILED",
      message: "We couldn't create your receipt. Please try again.",
    };
  }
};

/**
 * Toàn bộ phiếu mượn của một người dùng: phiếu cần xử lý lên trước
 * (Overdue -> Pending -> Borrowed -> Returned -> Expired), trong cùng một nhóm
 * thì mới tạo trước. Join sẵn với `books` để trang profile không phải N+1.
 */
export const getReceiptsByUserId = async (
  userId: string,
): Promise<ReceiptWithBook[]> => {
  const rows = await db
    .select({
      id: receipts.id,
      bookId: receipts.bookId,
      status: receipts.status,
      borrowDate: receipts.borrowDate,
      dueDate: receipts.dueDate,
      returnDate: receipts.returnDate,
      createdAt: receipts.createdAt,
      title: books.title,
      authorName: books.authorName,
      genre: books.genre,
      publishYear: books.publishYear,
      summary: books.summary,
      coverUrl: books.coverUrl,
    })
    .from(receipts)
    .innerJoin(books, eq(receipts.bookId, books.id))
    .where(eq(receipts.userId, userId))
    .orderBy(
      sql`CASE ${receipts.status}
            WHEN 'OVERDUE' THEN 0
            WHEN 'PENDING' THEN 1
            WHEN 'BORROWED' THEN 2
            WHEN 'RETURNED' THEN 3
            ELSE 4
          END`,
      desc(receipts.createdAt),
    );

  return rows.map((row) => ({
    id: row.id,
    bookId: row.bookId,
    status: row.status,
    borrowDate: row.borrowDate,
    dueDate: row.dueDate,
    returnDate: row.returnDate,
    createdAt: row.createdAt,
    book: {
      id: row.bookId,
      title: row.title,
      authorName: row.authorName,
      genre: row.genre,
      publishYear: row.publishYear,
      summary: row.summary,
      coverUrl: row.coverUrl,
    },
  }));
};

/**
 * Toàn bộ phiếu mượn kèm sách và người mượn, mới nhất trước — dữ liệu cho trang
 * quản trị. Trang admin lọc/sắp xếp trên tập này nên một JOIN là đủ, không N+1.
 */
export const getAllReceiptsWithDetails = async (): Promise<
  TicketWithDetails[]
> => {
  const rows = await db
    .select({
      id: receipts.id,
      status: receipts.status,
      borrowDate: receipts.borrowDate,
      dueDate: receipts.dueDate,
      returnDate: receipts.returnDate,
      createdAt: receipts.createdAt,
      readerId: users.id,
      readerName: users.fullName,
      readerEmail: users.email,
      bookId: books.id,
      bookTitle: books.title,
      bookAuthor: books.authorName,
      bookCoverUrl: books.coverUrl,
    })
    .from(receipts)
    .innerJoin(users, eq(receipts.userId, users.id))
    .innerJoin(books, eq(receipts.bookId, books.id))
    .orderBy(desc(receipts.createdAt));

  return rows.map((row) => ({
    id: row.id,
    readerId: row.readerId,
    bookId: row.bookId,
    status: row.status,
    borrowDate: row.borrowDate,
    dueDate: row.dueDate,
    returnDate: row.returnDate,
    createdAt: row.createdAt,
    reader: {
      id: row.readerId,
      fullName: row.readerName,
      email: row.readerEmail,
    },
    book: {
      id: row.bookId,
      title: row.bookTitle,
      authorName: row.bookAuthor,
      coverUrl: row.bookCoverUrl,
    },
  }));
};

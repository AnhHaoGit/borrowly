"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, sql, type SQL } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { books, receipts } from "@/database/schema";
import { getAdminUser } from "@/lib/admin";
import { APP_TIME_ZONE } from "@/lib/date";
import { LOAN_PERIOD_DAYS } from "@/lib/receipts";
import type { BorrowStatus } from "@/types/ticket";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Phiếu đang giữ một bản sách (đã trừ kho). RETURNED/EXPIRED coi như đã trả nên
// không còn chiếm bản nào.
const HOLDING_STATUSES: readonly BorrowStatus[] = [
  "PENDING",
  "BORROWED",
  "OVERDUE",
];

const ALL_STATUSES: readonly BorrowStatus[] = [
  ...HOLDING_STATUSES,
  "RETURNED",
  "EXPIRED",
];

export interface ReceiptSnapshot {
  status: BorrowStatus;
  borrowDate: Date | null;
  dueDate: string | null;
  returnDate: string | null;
  createdAt: Date;
}

export type ReceiptStatusResult =
  | { success: true; receipt: ReceiptSnapshot }
  | {
      success: false;
      code: "FORBIDDEN" | "INVALID" | "NOT_FOUND" | "OUT_OF_STOCK" | "FAILED";
      message: string;
    };

type ReceiptPatch = {
  status: BorrowStatus;
  borrowDate?: Date | null | SQL;
  dueDate?: string | null | SQL;
  returnDate?: string | null | SQL;
  createdAt?: Date | SQL;
};

const SNAPSHOT = {
  status: receipts.status,
  borrowDate: receipts.borrowDate,
  dueDate: receipts.dueDate,
  returnDate: receipts.returnDate,
  createdAt: receipts.createdAt,
};

/** Giữ chỗ một bản sách; trả về false khi kho đã hết. */
const reserveCopy = async (bookId: string): Promise<boolean> => {
  const [row] = await db
    .update(books)
    .set({ availableQuantity: sql`${books.availableQuantity} - 1` })
    .where(and(eq(books.id, bookId), gt(books.availableQuantity, 0)))
    .returning({ id: books.id });

  return Boolean(row);
};

/** Cộng lại một bản vào kho (không bao giờ đẩy số lượng xuống dưới 0). */
const releaseCopy = async (bookId: string): Promise<void> => {
  await db
    .update(books)
    .set({ availableQuantity: sql`${books.availableQuantity} + 1` })
    .where(eq(books.id, bookId));
};

/**
 * Ngày tháng đi kèm mỗi trạng thái, tính bằng ngày hôm nay ở múi giờ của thư
 * viện (Postgres chạy UTC nên `CURRENT_DATE` sẽ lệch một ngày vào buổi sáng ở
 * Việt Nam):
 *  - PENDING   : bắt đầu lại cửa sổ 2 ngày đến nhận (createdAt = now);
 *  - BORROWED  : ngày nhận = hôm nay (nếu chưa có) và hạn trả = hôm nay + 14 ngày;
 *  - OVERDUE   : giữ nguyên ngày nhận/hạn trả, chỉ đổi trạng thái;
 *  - RETURNED  : ghi ngày trả = hôm nay;
 *  - EXPIRED   : không thêm mốc thời gian nào.
 */
const buildPatch = (
  current: {
    borrowDate: Date | null;
    dueDate: string | null;
    returnDate: string | null;
  },
  nextStatus: BorrowStatus,
): ReceiptPatch => {
  switch (nextStatus) {
    case "PENDING":
      return {
        status: nextStatus,
        borrowDate: null,
        dueDate: null,
        returnDate: null,
        createdAt: sql`now()`,
      };

    case "BORROWED":
      return {
        status: nextStatus,
        borrowDate: current.borrowDate ?? sql`now()`,
        dueDate: sql`(now() AT TIME ZONE ${APP_TIME_ZONE})::date + ${LOAN_PERIOD_DAYS}::int`,
        returnDate: null,
      };

    case "OVERDUE":
      return {
        status: nextStatus,
        borrowDate: current.borrowDate ?? sql`now()`,
        dueDate:
          current.dueDate ?? sql`(now() AT TIME ZONE ${APP_TIME_ZONE})::date`,
        returnDate: null,
      };

    case "RETURNED":
      return {
        status: nextStatus,
        returnDate:
          current.returnDate ?? sql`(now() AT TIME ZONE ${APP_TIME_ZONE})::date`,
      };

    case "EXPIRED":
      return { status: nextStatus };

    default:
      return { status: nextStatus };
  }
};

/**
 * Đổi trạng thái một phiếu mượn từ trang admin.
 *
 * Tồn kho được chỉnh theo đúng chênh lệch "giữ bản / trả bản" của hai trạng
 * thái, nên đổi qua lại nhiều lần cũng không làm sai số lượng: PENDING,
 * BORROWED, OVERDUE đang giữ một bản; RETURNED và EXPIRED thì không.
 */
export async function updateReceiptStatus(
  receiptId: string,
  nextStatus: BorrowStatus,
): Promise<ReceiptStatusResult> {
  const admin = await getAdminUser();

  if (!admin) {
    return {
      success: false,
      code: "FORBIDDEN",
      message: "You don't have permission to do that.",
    };
  }

  if (!UUID_RE.test(receiptId)) {
    return { success: false, code: "NOT_FOUND", message: "Receipt not found." };
  }

  if (!ALL_STATUSES.includes(nextStatus)) {
    return {
      success: false,
      code: "INVALID",
      message: "That status doesn't exist.",
    };
  }

  try {
    const [receipt] = await db
      .select({
        id: receipts.id,
        bookId: receipts.bookId,
        status: receipts.status,
        borrowDate: receipts.borrowDate,
        dueDate: receipts.dueDate,
        returnDate: receipts.returnDate,
      })
      .from(receipts)
      .where(eq(receipts.id, receiptId))
      .limit(1);

    if (!receipt) {
      return { success: false, code: "NOT_FOUND", message: "Receipt not found." };
    }

    if (receipt.status === nextStatus) {
      const [snapshot] = await db
        .select(SNAPSHOT)
        .from(receipts)
        .where(eq(receipts.id, receiptId))
        .limit(1);

      return snapshot
        ? { success: true, receipt: snapshot }
        : { success: false, code: "NOT_FOUND", message: "Receipt not found." };
    }

    // "Quá hạn" chỉ có nghĩa với một phiếu đang mượn.
    if (nextStatus === "OVERDUE" && receipt.status !== "BORROWED") {
      return {
        success: false,
        code: "INVALID",
        message: "Mark the ticket as borrowed before setting it to overdue.",
      };
    }

    const holdsCopy = (status: BorrowStatus) =>
      HOLDING_STATUSES.includes(status);

    const gaining = holdsCopy(nextStatus) && !holdsCopy(receipt.status);
    const releasing = !holdsCopy(nextStatus) && holdsCopy(receipt.status);

    if (gaining && !(await reserveCopy(receipt.bookId))) {
      return {
        success: false,
        code: "OUT_OF_STOCK",
        message:
          "All copies of this book are on loan, so the ticket can't go back to an active status.",
      };
    }

    try {
      const [updated] = await db
        .update(receipts)
        .set(buildPatch(receipt, nextStatus))
        .where(eq(receipts.id, receiptId))
        .returning(SNAPSHOT);

      if (!updated) {
        if (gaining) await releaseCopy(receipt.bookId);

        return { success: false, code: "NOT_FOUND", message: "Receipt not found." };
      }

      // Phiếu đã đóng thì bản sách quay lại kho.
      if (releasing) await releaseCopy(receipt.bookId);

      revalidatePath("/admin/tickets");
      revalidatePath("/profile");
      revalidatePath("/books");
      revalidatePath(`/books/${receipt.bookId}`);
      revalidatePath("/admin/books");

      return { success: true, receipt: updated };
    } catch (error) {
      console.error("Failed to update receipt status:", error);

      // Hoàn lại đúng phần tồn kho vừa thay đổi để kho không lệch.
      if (gaining) await releaseCopy(receipt.bookId);

      return {
        success: false,
        code: "FAILED",
        message: "Unable to update the status. Please try again.",
      };
    }
  } catch (error) {
    console.error("Failed to load receipt:", error);

    return {
      success: false,
      code: "FAILED",
      message: "Unable to update the status. Please try again.",
    };
  }
}

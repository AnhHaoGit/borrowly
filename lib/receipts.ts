import type { ReceiptWithBook } from "@/types/receipt";
import type { BorrowStatus } from "@/types/ticket";

// Phiếu PENDING quá 2 ngày không đến nhận sẽ chuyển sang EXPIRED.
export const PICKUP_WINDOW_DAYS = 2;

// Sách đã giao cho người mượn được giữ LOAN_PERIOD_DAYS ngày.
export const LOAN_PERIOD_DAYS = 14;

// Mỗi người chỉ được giữ tối đa 10 cuốn chưa trả (PENDING, BORROWED, OVERDUE).
export const BORROW_LIMIT = 10;

/**
 * Việc admin được phép làm với từng trạng thái phiếu ở /admin/tickets.
 *  - PENDING  -> BORROWED: người đọc đã đến nhận sách;
 *  - BORROWED -> RETURNED: sách đã trả;
 *  - OVERDUE  -> RETURNED: trả muộn;
 *  - RETURNED, EXPIRED: phiếu đã đóng, không đổi được gì nữa.
 * PENDING, OVERDUE và EXPIRED còn lại là do hệ thống tự chuyển sau 2 và 14 ngày.
 */
export const STATUS_TRANSITIONS: Record<
  BorrowStatus,
  readonly BorrowStatus[]
> = {
  PENDING: ["BORROWED"],
  BORROWED: ["RETURNED"],
  OVERDUE: ["RETURNED"],
  RETURNED: [],
  EXPIRED: [],
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Hạn đến nhận sách = thời điểm tạo phiếu + PICKUP_WINDOW_DAYS. */
export const getPickupDeadline = (createdAt: Date | string): Date => {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);

  return new Date(created.getTime() + PICKUP_WINDOW_DAYS * DAY_MS);
};

export interface GroupedReceipts {
  /** Chờ đến nhận sách (PENDING), hạn nhận gần nhất lên trước. */
  pickup: ReceiptWithBook[];
  /** Đang mượn trên kệ (BORROWED, OVERDUE), hạn trả gần nhất lên trước. */
  shelf: ReceiptWithBook[];
  /** Phiếu đã đóng (RETURNED, EXPIRED), mới nhất lên trước. */
  history: ReceiptWithBook[];
}

const time = (value: Date | string): number =>
  (value instanceof Date ? value : new Date(value)).getTime();

/**
 * Tách phiếu của người dùng thành ba nhóm để trang profile trả lời đúng câu hỏi
 * "còn gì phải làm": nhận sách, trả sách, hay đã xong. Trong mỗi nhóm, phiếu
 * cận hạn nhất luôn đứng đầu.
 */
export const groupReceipts = (receipts: ReceiptWithBook[]): GroupedReceipts => {
  const groups: GroupedReceipts = { pickup: [], shelf: [], history: [] };

  for (const receipt of receipts) {
    if (receipt.status === "PENDING") groups.pickup.push(receipt);
    else if (receipt.status === "BORROWED" || receipt.status === "OVERDUE")
      groups.shelf.push(receipt);
    else groups.history.push(receipt);
  }

  groups.pickup.sort(
    (a, b) => getPickupDeadline(a.createdAt).getTime() - getPickupDeadline(b.createdAt).getTime(),
  );

  // dueDate là "YYYY-MM-DD" nên so sánh chuỗi đã đúng thứ tự thời gian; phiếu
  // thiếu hạn trả bị đẩy xuống cuối.
  groups.shelf.sort((a, b) => {
    const aDue = a.dueDate ?? "9999-12-31";
    const bDue = b.dueDate ?? "9999-12-31";
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;

    return time(a.createdAt) - time(b.createdAt);
  });

  groups.history.sort((a, b) => time(b.createdAt) - time(a.createdAt));

  return groups;
};

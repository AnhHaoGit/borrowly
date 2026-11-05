// Phiếu PENDING quá 2 ngày không đến nhận sẽ chuyển sang EXPIRED.
export const PICKUP_WINDOW_DAYS = 2;

// Mỗi người chỉ được giữ tối đa 10 cuốn chưa trả (PENDING, BORROWED, OVERDUE).
export const BORROW_LIMIT = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Hạn đến nhận sách = thời điểm tạo phiếu + PICKUP_WINDOW_DAYS. */
export const getPickupDeadline = (createdAt: Date | string): Date => {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);

  return new Date(created.getTime() + PICKUP_WINDOW_DAYS * DAY_MS);
};

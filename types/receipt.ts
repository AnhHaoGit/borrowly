import type { BorrowStatus } from "./ticket";

// Một phiếu mượn kèm thông tin sách đã join sẵn, đúng những gì thẻ receipt
// ở trang profile cần hiển thị (không kéo theo description/subjects cho nhẹ).
export interface ReceiptWithBook {
  id: string;
  bookId: string;
  status: BorrowStatus;
  borrowDate: Date | null; // null cho tới khi admin kích hoạt và sách được giao
  dueDate: string | null; // "YYYY-MM-DD"
  returnDate: string | null; // "YYYY-MM-DD"
  createdAt: Date; // thời điểm người dùng bấm mượn
  book: {
    id: string;
    title: string;
    authorName: string;
    genre: string;
    publishYear: number;
    summary: string;
    coverUrl: string;
  };
}

// Trạng thái phiếu mà người đang xem còn giữ theo từng cuốn sách: dùng để vẽ
// nút Borrow cho đúng (Pending/Borrowed/Overdue).
export type ActiveBorrowStates = Record<string, BorrowStatus>;

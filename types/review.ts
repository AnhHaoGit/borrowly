// Số sao được lưu bằng "nửa sao": 1 = 0.5★ … 10 = 5★.
// Dùng số nguyên để cộng/trung bình không bị sai số dấu phẩy động.
export const MIN_RATING = 1;
export const MAX_RATING = 10;
export const MAX_COMMENT_LENGTH = 1000;

export interface BookReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // nửa sao, 1..10
  comment: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ReviewSummary {
  /** Trung bình cộng của tất cả đánh giá, 0..5. null = chưa có ai đánh giá. */
  average: number | null;
  /** Số lượt đánh giá. */
  count: number;
}

export interface ReviewState extends ReviewSummary {
  reviews: BookReview[];
  /** Đánh giá của người đang đăng nhập (nếu có), để sửa/xoá. */
  viewer: BookReview | null;
}

/** Đổi nửa sao (1..10) sang số sao hiển thị (0.5..5). */
export const toStars = (halfStars: number) => halfStars / 2;

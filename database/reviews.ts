import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { books, reviews, users } from "@/database/schema";
import type { BookReview, ReviewState } from "@/types/review";

// Danh sách review hiển thị tối đa từng này bản mới nhất; đủ cho một trang chi tiết
// mà không phải phân trang, và trung bình cộng vẫn tính trên toàn bộ review.
const REVIEWS_LIMIT = 100;

const toISOString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const reviewColumns = {
  id: reviews.id,
  userId: reviews.userId,
  userName: users.fullName,
  rating: reviews.rating,
  comment: reviews.comment,
  createdAt: reviews.createdAt,
  updatedAt: reviews.updatedAt,
};

/** Review của một cuốn sách, mới cập nhật nhất lên trước. */
export const getBookReviews = async (
  bookId: string,
): Promise<BookReview[]> => {
  const rows = await db
    .select(reviewColumns)
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.bookId, bookId))
    .orderBy(desc(reviews.updatedAt))
    .limit(REVIEWS_LIMIT);

  return rows.map((row) => ({
    ...row,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  }));
};

/**
 * Toàn bộ dữ liệu phần đánh giá của một cuốn sách: danh sách review,
 * trung bình cộng + số lượt (đọc từ `books` đã cache sẵn) và review của
 * người đang xem.
 */
export const getReviewState = async (
  bookId: string,
  viewerId?: string | null,
): Promise<ReviewState> => {
  const [rows, [summary]] = await Promise.all([
    getBookReviews(bookId),
    db
      .select({ average: books.rating, count: books.ratingCount })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1),
  ]);

  return {
    reviews: rows,
    viewer: viewerId ? (rows.find((row) => row.userId === viewerId) ?? null) : null,
    average: summary?.average ?? null,
    count: summary?.count ?? 0,
  };
};

/**
 * Một người dùng chỉ có một review cho mỗi cuốn sách, nên "thêm" và "sửa"
 * dùng chung một câu upsert (đã có unique index bảo vệ ở tầng database).
 */
export const saveReview = async ({
  bookId,
  userId,
  rating,
  comment,
}: {
  bookId: string;
  userId: string;
  rating: number;
  comment: string | null;
}) => {
  const [row] = await db
    .insert(reviews)
    .values({ bookId, userId, rating, comment })
    .onConflictDoUpdate({
      target: [reviews.bookId, reviews.userId],
      set: { rating, comment, updatedAt: new Date() },
    })
    .returning({ id: reviews.id });

  return row ?? null;
};

/** Xoá review của chính mình; trả về true nếu thực sự có bản ghi bị xoá. */
export const deleteReview = async (bookId: string, userId: string) => {
  const deleted = await db
    .delete(reviews)
    .where(and(eq(reviews.bookId, bookId), eq(reviews.userId, userId)))
    .returning({ id: reviews.id });

  return deleted.length > 0;
};

/**
 * Ghi lại trung bình cộng + tổng số lượt đánh giá vào `books`.
 * Chạy trong đúng một statement (CTE + UPDATE) để không có trạng thái trung gian
 * và không cần transaction trên driver HTTP của Neon.
 */
export const refreshBookRating = async (bookId: string) => {
  await db.execute(sql`
    WITH agg AS (
      SELECT AVG(${reviews.rating})::real / 2 AS average,
             COUNT(*)::int AS total
      FROM ${reviews}
      WHERE ${reviews.bookId} = ${bookId}
    )
    UPDATE ${books}
    SET rating = agg.average,
        rating_count = agg.total
    FROM agg
    WHERE ${books.id} = ${bookId}
  `);
};

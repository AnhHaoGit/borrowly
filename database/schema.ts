import {
  varchar,
  uuid,
  integer,
  text,
  pgTable,
  date,
  pgEnum,
  real,
  smallint,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN"]);
export const BORROW_STATUS_ENUM = pgEnum("borrow_status", [
  "PENDING",
  "BORROWED",
  "RETURNED",
  "OVERDUE",
  "EXPIRED",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: ROLE_ENUM("role").notNull().default("USER"),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorImageUrl: text("author_image_url"),
    genre: text("genre").notNull(),
    publishYear: integer("publish_year").notNull(),
    coverUrl: text("cover_url").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    availableQuantity: integer("available_quantity").notNull().default(0),
    // Trung bình cộng rating của bảng reviews (0..5), null = chưa có đánh giá.
    // Đây là giá trị cache sẵn để trang danh sách không phải aggregate mỗi lần đọc.
    rating: real("rating"),
    ratingCount: integer("rating_count").notNull().default(0),
    borrowCount: integer("borrow_count").notNull().default(0),
    language: text("language").notNull(),
    subjects: text("subjects")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    subjectPlaces: text("subject_places")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    subjectTimes: text("subject_times")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    publishers: text("publishers")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("books_genre_idx").on(t.genre),
    index("books_publish_year_idx").on(t.publishYear),
    index("books_borrow_count_idx").on(t.borrowCount),
    index("books_subjects_idx").using("gin", t.subjects),
    check("books_quantity_non_negative", sql`${t.availableQuantity} >= 0`),
    check("books_borrow_count_non_negative", sql`${t.borrowCount} >= 0`),
    check(
      "books_rating_range",
      sql`${t.rating} IS NULL OR (${t.rating} >= 0 AND ${t.rating} <= 5)`,
    ),
    check("books_rating_count_non_negative", sql`${t.ratingCount} >= 0`),
  ],
);

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    bookId: uuid("book_id")
      .references(() => books.id)
      .notNull(),
    status: BORROW_STATUS_ENUM("status").notNull().default("PENDING"),
    borrowDate: timestamp("borrow_date", { withTimezone: true }),
    dueDate: date("due_date"),
    returnDate: date("return_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("receipts_user_idx").on(t.userId),
    index("receipts_book_idx").on(t.bookId),
    index("receipts_status_idx").on(t.status),
  ],
);

// Mỗi người dùng chỉ có đúng một đánh giá cho mỗi cuốn sách: "thêm" và "sửa"
// là cùng một câu upsert, và trung bình cộng luôn tính trên người thật.
// rating lưu bằng nửa sao (1 = 0.5★, 10 = 5★) dưới dạng smallint để phép
// cộng/trung bình không có sai số dấu phẩy động.
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("reviews_book_user_unique").on(t.bookId, t.userId),
    index("reviews_book_updated_idx").on(t.bookId, t.updatedAt),
    index("reviews_user_idx").on(t.userId),
    check("reviews_rating_range", sql`${t.rating} >= 1 AND ${t.rating} <= 10`),
    check(
      "reviews_comment_length",
      sql`${t.comment} IS NULL OR char_length(${t.comment}) <= 1000`,
    ),
  ],
);

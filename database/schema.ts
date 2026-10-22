import {
  varchar,
  uuid,
  integer,
  text,
  pgTable,
  date,
  pgEnum,
  real,
  timestamp,
  index,
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
    rating: real("rating"), // null = chưa có đánh giá
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

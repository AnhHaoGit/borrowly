"use server";

import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { books, receipts } from "@/database/schema";
import { getAdminUser } from "@/lib/admin";
import {
  validateBookInput,
  type BookFieldErrors,
  type BookInput,
} from "@/lib/book-input";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AdminBookResult =
  | { success: true; bookId: string }
  | {
      success: false;
      code: "FORBIDDEN" | "INVALID" | "NOT_FOUND" | "HAS_HISTORY" | "FAILED";
      message: string;
      errors?: BookFieldErrors;
    };

const toColumns = (input: BookInput) => ({
  title: input.title.trim(),
  authorName: input.authorName.trim(),
  authorImageUrl: input.authorImageUrl,
  genre: input.genre,
  publishYear: input.publishYear,
  coverUrl: input.coverUrl.trim(),
  summary: input.summary.trim(),
  description: input.description.trim(),
  availableQuantity: input.availableQuantity,
  language: input.language,
  subjects: input.subjects,
  subjectPlaces: input.subjectPlaces,
  subjectTimes: input.subjectTimes,
  publishers: input.publishers,
});

const revalidateBooks = (bookId?: string) => {
  revalidatePath("/admin/books");
  revalidatePath("/books");

  if (bookId) {
    revalidatePath(`/admin/books/${bookId}`);
    revalidatePath(`/books/${bookId}`);
  }
};

export async function createBook(input: BookInput): Promise<AdminBookResult> {
  // Quyền được kiểm tra ở server, không dựa vào việc client có ẩn nút hay không.
  const admin = await getAdminUser();

  if (!admin) {
    return {
      success: false,
      code: "FORBIDDEN",
      message: "You don't have permission to do that.",
    };
  }

  const errors = validateBookInput(input);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      code: "INVALID",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  try {
    const [created] = await db
      .insert(books)
      .values(toColumns(input))
      .returning({ id: books.id });

    if (!created) {
      return {
        success: false,
        code: "FAILED",
        message: "Unable to create the book.",
      };
    }

    revalidateBooks(created.id);

    return { success: true, bookId: created.id };
  } catch (error) {
    console.error("Failed to create book:", error);

    return {
      success: false,
      code: "FAILED",
      message: "Unable to create the book. Please try again.",
    };
  }
}

export async function updateBook(
  bookId: string,
  input: BookInput,
): Promise<AdminBookResult> {
  const admin = await getAdminUser();

  if (!admin) {
    return {
      success: false,
      code: "FORBIDDEN",
      message: "You don't have permission to do that.",
    };
  }

  if (!UUID_RE.test(bookId)) {
    return { success: false, code: "NOT_FOUND", message: "Book not found." };
  }

  const errors = validateBookInput(input);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      code: "INVALID",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  try {
    const updated = await db
      .update(books)
      .set(toColumns(input))
      .where(eq(books.id, bookId))
      .returning({ id: books.id });

    if (updated.length === 0) {
      return { success: false, code: "NOT_FOUND", message: "Book not found." };
    }

    revalidateBooks(bookId);

    return { success: true, bookId };
  } catch (error) {
    console.error("Failed to update book:", error);

    return {
      success: false,
      code: "FAILED",
      message: "Unable to save your changes. Please try again.",
    };
  }
}

export async function deleteBook(bookId: string): Promise<AdminBookResult> {
  const admin = await getAdminUser();

  if (!admin) {
    return {
      success: false,
      code: "FORBIDDEN",
      message: "You don't have permission to do that.",
    };
  }

  if (!UUID_RE.test(bookId)) {
    return { success: false, code: "NOT_FOUND", message: "Book not found." };
  }

  try {
    // Phiếu mượn tham chiếu tới sách không có onDelete cascade, nên xoá sách đã
    // có lịch sử mượn sẽ vi phạm khoá ngoại. Chặn trước và báo rõ lý do.
    const [history] = await db
      .select({ total: count() })
      .from(receipts)
      .where(eq(receipts.bookId, bookId));

    if (Number(history?.total ?? 0) > 0) {
      return {
        success: false,
        code: "HAS_HISTORY",
        message:
          "This book has borrowing history, so it can't be deleted. Set its available copies to 0 instead.",
      };
    }

    const removed = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning({ id: books.id });

    if (removed.length === 0) {
      return { success: false, code: "NOT_FOUND", message: "Book not found." };
    }

    revalidateBooks(bookId);

    return { success: true, bookId };
  } catch (error) {
    console.error("Failed to delete book:", error);

    return {
      success: false,
      code: "FAILED",
      message: "Unable to delete the book. Please try again.",
    };
  }
}

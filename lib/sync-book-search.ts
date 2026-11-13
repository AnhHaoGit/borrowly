import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { BOOKS_INDEX, elasticsearch, isElasticsearchConfigured } from "@/lib/elasticsearch";

type BookRecord = typeof books.$inferSelect;

export async function indexBook(book: BookRecord) {
  await elasticsearch.index({
    index: BOOKS_INDEX,
    id: String(book.id),
    document: {
      id: String(book.id),
      title: book.title,
      authorName: book.authorName,
      genre: book.genre,
      publishYear: book.publishYear,
      availableQuantity: book.availableQuantity,
      summary: book.summary,
      subjects: book.subjects,
    },
  });
}

/**
 * Đồng bộ một sách trong database lên index tìm kiếm.
 *
 * Best-effort: Elasticsearch có thể chưa cấu hình hoặc đang lỗi, khi đó việc
 * lưu sách trong database vẫn phải thành công — chỉ ghi log.
 */
export async function syncBookToSearch(bookId: string) {
  if (!isElasticsearchConfigured) return;

  try {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (book) await indexBook(book);
  } catch (error) {
    console.error("Failed to index book in Elasticsearch:", error);
  }
}

export async function removeBookFromSearchSafely(id: string) {
  if (!isElasticsearchConfigured) return;

  try {
    await removeBookFromSearch(id);
  } catch (error) {
    console.error("Failed to remove book from Elasticsearch:", error);
  }
}

export async function removeBookFromSearch(id: string) {
  try {
    await elasticsearch.delete({
      index: BOOKS_INDEX,
      id,
    });
  } catch (error) {
    const statusCode = (error as { meta?: { statusCode?: number } }).meta
      ?.statusCode;

    if (statusCode !== 404) {
      throw error;
    }
  }
}

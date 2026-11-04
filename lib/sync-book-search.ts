import { books } from "@/database/schema";
import { BOOKS_INDEX, elasticsearch } from "@/lib/elasticsearch";

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
    },
  });
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

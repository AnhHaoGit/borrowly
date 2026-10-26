import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { BOOKS_INDEX, elasticsearch } from "@/lib/elasticsearch";

async function main() {
  const exists = await elasticsearch.indices.exists({
    index: BOOKS_INDEX,
  });

  if (!exists) {
    await elasticsearch.indices.create({
      index: BOOKS_INDEX,
      settings: {
        analysis: {
          normalizer: {
            lowercase_normalizer: {
              type: "custom",
              filter: ["lowercase"],
            },
          },
        },
      },
      mappings: {
        properties: {
          title: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                normalizer: "lowercase_normalizer",
              },
            },
          },
          authorName: { type: "text" },
          genre: { type: "keyword" },
          publishYear: { type: "integer" },
          availableQuantity: { type: "integer" },
          summary: { type: "text" },
        },
      },
    });
  }

  const allBooks = await db.select().from(books);

  // Dùng bulk để đồng bộ nhiều sách trong một lần.
  for (let i = 0; i < allBooks.length; i += 500) {
    const batch = allBooks.slice(i, i + 500);

    const operations = batch.flatMap((book) => [
      {
        index: {
          _index: BOOKS_INDEX,
          _id: String(book.id),
        },
      },
      {
        id: String(book.id),
        title: book.title,
        authorName: book.authorName,
        genre: book.genre,
        publishYear: book.publishYear,
        availableQuantity: book.availableQuantity,
        summary: book.summary,
      },
    ]);

    if (operations.length > 0) {
      const result = await elasticsearch.bulk({
        operations,
        refresh: false,
      });

      if (result.errors) {
        const failures = result.items.filter((item) => {
          return item.index?.error;
        });

        throw new Error(`Failed to index ${failures.length} books`);
      }
    }
  }

  await elasticsearch.indices.refresh({
    index: BOOKS_INDEX,
  });

  console.log(`Indexed ${allBooks.length} books.`);
}

main()
  .catch((error) => {
    console.error("Failed to sync books:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await elasticsearch.close();
  });

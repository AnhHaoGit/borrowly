/**
 * Đồng bộ toàn bộ bảng `books` lên Elasticsearch.
 *
 * Chạy: npm run es:sync
 * Xoá index cũ rồi dựng lại từ đầu: npm run es:sync -- --recreate
 *
 * Script này cần ELASTICSEARCH_URL / ELASTICSEARCH_API_KEY / ELASTICSEARCH_INDEX
 * trỏ tới một cụm Elasticsearch còn sống.
 */
import { db } from "../database/drizzle";
import { books } from "../database/schema";
import { BOOKS_INDEX, elasticsearch } from "../lib/elasticsearch";

const BATCH_SIZE = 500;

async function main() {
  if (process.argv.includes("--recreate")) {
    await elasticsearch.indices.delete({
      index: BOOKS_INDEX,
      ignore_unavailable: true,
    });
    console.log(`Đã xoá index ${BOOKS_INDEX} (nếu có).`);
  }

  const exists = await elasticsearch.indices.exists({ index: BOOKS_INDEX });

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
          subjects: { type: "keyword" },
        },
      },
    });
    console.log(`Đã tạo index ${BOOKS_INDEX}.`);
  }

  const allBooks = await db.select().from(books);

  for (let i = 0; i < allBooks.length; i += BATCH_SIZE) {
    const batch = allBooks.slice(i, i + BATCH_SIZE);

    const operations = batch.flatMap((book) => [
      { index: { _index: BOOKS_INDEX, _id: String(book.id) } },
      {
        id: String(book.id),
        title: book.title,
        authorName: book.authorName,
        genre: book.genre,
        publishYear: book.publishYear,
        availableQuantity: book.availableQuantity,
        summary: book.summary,
        subjects: book.subjects,
      },
    ]);

    if (operations.length === 0) continue;

    const result = await elasticsearch.bulk({ operations, refresh: false });

    if (result.errors) {
      const failures = result.items.filter((item) => item.index?.error);

      throw new Error(
        `Index lỗi ${failures.length} sách, ví dụ: ${JSON.stringify(failures[0])}`,
      );
    }

    console.log(
      `Đã index ${Math.min(i + BATCH_SIZE, allBooks.length)}/${allBooks.length}`,
    );
  }

  await elasticsearch.indices.refresh({ index: BOOKS_INDEX });

  console.log(`Hoàn tất: ${allBooks.length} sách nằm trong index ${BOOKS_INDEX}.`);
}

main()
  .catch((error) => {
    console.error("Đồng bộ thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await elasticsearch.close();
  });

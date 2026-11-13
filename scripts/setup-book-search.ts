/**
 * Bật tìm kiếm gần đúng bằng trigram trong Postgres.
 *
 * Đây là đường dự phòng khi Elasticsearch không dùng được: `pg_trgm` cho phép
 * so khớp mờ ("calculs" vẫn ra "Calculus") với chỉ mục GIN nên vẫn nhanh trên
 * vài trăm nghìn dòng.
 *
 * Chạy: npm run search:setup
 *
 * Câu lệnh đều là IF NOT EXISTS nên chạy lại nhiều lần vẫn an toàn.
 */
import { sql } from "drizzle-orm";
import { db } from "../database/drizzle";

async function main() {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS books_title_trgm_idx ON books USING gin (title gin_trgm_ops)`,
  );

  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS books_author_trgm_idx ON books USING gin (author_name gin_trgm_ops)`,
  );

  // Mô tả là cột text dài: index trigram giúp `ILIKE '%từ khóa%'` không phải
  // quét rồi so khớp từng dòng.
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS books_summary_trgm_idx ON books USING gin (summary gin_trgm_ops)`,
  );

  const rows = await db.execute(sql`
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'books' AND indexname LIKE 'books%trgm%'
    ORDER BY indexname
  `);

  console.log("Trigram fuzzy search đã sẵn sàng. Index:", rows.rows);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Không bật được trigram search:", error);
    process.exit(1);
  });

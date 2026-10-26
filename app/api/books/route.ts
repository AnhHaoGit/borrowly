import { NextRequest, NextResponse } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { estypes } from "@elastic/elasticsearch";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { BOOKS_INDEX, elasticsearch } from "@/lib/elasticsearch";

const PAGE_SIZE = 12;
const MAX_SEARCH_RESULTS = 10_000;

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
    const limit = PAGE_SIZE;
    const offset = (page - 1) * limit;

    const query = params.get("query")?.trim() ?? "";
    const genres = params.getAll("genre");
    const yearMin = params.get("yearMin");
    const yearMax = params.get("yearMax");
    const status = params.get("status") ?? "all";
    const sort = params.get("sort") ?? "default";

    // 1. Elasticsearch chỉ tìm kiếm từ khóa.
    // Không đưa genre, year, status hoặc sort vào Elasticsearch.
    let searchIds: string[] | null = null;

    if (query) {
      const result = await elasticsearch.search({
        index: BOOKS_INDEX,
        from: 0,
        size: MAX_SEARCH_RESULTS,
        track_total_hits: true,
        query: {
          multi_match: {
            query,
            fields: ["title^5", "authorName^3", "summary"],
            type: "best_fields",
            fuzziness: "AUTO",
            prefix_length: 1,
          },
        },
      });

      searchIds = result.hits.hits
        .map((hit) => hit._id)
        .filter((id): id is string => id !== undefined);
    }

    // 2. Drizzle xử lý tất cả bộ lọc.
    const conditions: ReturnType<typeof eq>[] = [];

    if (searchIds !== null) {
      // Không có kết quả tìm kiếm thì không trả về sách nào.
      if (searchIds.length === 0) {
        return NextResponse.json({
          items: [],
          page,
          pageSize: limit,
          total: 0,
          totalPages: 0,
        });
      }

      // Elasticsearch trả _id dạng string.
      // Chuyển đổi giá trị theo kiểu ID thực tế trong schema nếu cần.
      conditions.push(
        inArray(
          books.id,
          searchIds as unknown as (typeof books.$inferSelect)["id"][],
        ),
      );
    }

    if (genres.length > 0) {
      conditions.push(or(...genres.map((genre) => eq(books.genre, genre)))!);
    }

    if (yearMin !== null && yearMin !== "") {
      const value = Number(yearMin);

      if (Number.isFinite(value)) {
        conditions.push(gte(books.publishYear, value));
      }
    }

    if (yearMax !== null && yearMax !== "") {
      const value = Number(yearMax);

      if (Number.isFinite(value)) {
        conditions.push(lte(books.publishYear, value));
      }
    }

    if (status === "available") {
      conditions.push(gte(books.availableQuantity, 1));
    } else if (status === "unavailable") {
      conditions.push(eq(books.availableQuantity, 0));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 3. Drizzle xử lý sort như trước.
    const lastWordInitial = sql<string>`
      LOWER(
        LEFT(
          REGEXP_REPLACE(${books.title}, '^.*[[:space:]]', ''),
          1
        )
      )
    `;

    const orderBy = (() => {
      switch (sort) {
        case "title-asc":
          return [asc(lastWordInitial), asc(books.title)];

        case "title-desc":
          return [desc(lastWordInitial), asc(books.title)];

        case "year-asc":
          return [asc(books.publishYear)];

        case "year-desc":
          return [desc(books.publishYear)];

        default:
          return null;
      }
    })();

    // 4. Phân trang và đếm tổng sau khi đã áp dụng
    // từ khóa tìm kiếm cùng tất cả bộ lọc.
    const itemsQuery = db.select().from(books).where(whereClause);

    const [items, totalResult] = await Promise.all([
      orderBy
        ? itemsQuery
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset)
        : itemsQuery.limit(limit).offset(offset),

      db.select({ total: count() }).from(books).where(whereClause),
    ]);

    const total = Number(totalResult[0]?.total ?? 0);

    return NextResponse.json({
      items,
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch books:", error);

    return NextResponse.json(
      { message: "Failed to fetch books" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = PAGE_SIZE;
    const offset = (page - 1) * limit;

    const query = params.get("query")?.trim() ?? "";
    const genres = params.getAll("genre");
    const yearMin = params.get("yearMin");
    const yearMax = params.get("yearMax");
    const status = params.get("status") ?? "all";
    const sort = params.get("sort") ?? "default";

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(books.title, `%${query}%`),
          ilike(books.authorName, `%${query}%`),
        )!,
      );
    }

    if (genres.length > 0) {
      // Nếu genre là text đơn, nhiều genre được chọn dùng OR.
      // Cần kết hợp với các điều kiện lọc khác bằng AND.
      conditions.push(or(...genres.map((genre) => eq(books.genre, genre)))!);
    }

    if (yearMin !== null && yearMin !== "") {
      conditions.push(gte(books.publishYear, Number(yearMin)));
    }

    if (yearMax !== null && yearMax !== "") {
      conditions.push(lte(books.publishYear, Number(yearMax)));
    }

    if (status === "available") {
      conditions.push(gte(books.availableQuantity, 1));
    } else if (status === "unavailable") {
      conditions.push(eq(books.availableQuantity, 0));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Lấy chữ cái đầu của từ cuối cùng trong tiêu đề.
    // Ví dụ: "The Great Gatsby" -> "g"
    const lastWordInitial = sql<string>`
  LOWER(
    LEFT(
      REGEXP_REPLACE(${books.title}, '^.*\\s', ''),
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

    const [items, totalResult] = await Promise.all([
      orderBy
        ? db
            .select()
            .from(books)
            .where(whereClause)
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset)
        : db
            .select()
            .from(books)
            .where(whereClause)
            .limit(limit)
            .offset(offset),

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

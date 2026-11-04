import { Suspense, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import BookDetail from "@/components/books/BookDetail";
import { PageLoader } from "@/components/ui/Loader";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { getReviewState } from "@/database/reviews";

// Trang cần `params` + dữ liệu database trước khi trả lời, nên cho phép route
// block. Nhờ vậy `notFound()` chạy xong trước khi response bắt đầu và URL sai
// vẫn trả về đúng status 404 (nếu stream ngay từ đầu thì status thành 200).
export const instant = false;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SIMILAR_LIMIT = 10;

// `cache()` giúp `generateMetadata`, phần kiểm tra tồn tại và phần nội dung
// dùng chung một truy vấn trong cùng một request.
const getBook = cache(async (id: string) => {
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);

  if (!book) {
    notFound();
  }

  return book;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);

  return {
    title: book.title,
    description: book.summary.slice(0, 160),
  };
}

async function BookDetailContent({ id }: { id: string }) {
  const book = await getBook(id);

  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  // Sách cùng thể loại, ưu tiên sách được mượn nhiều.
  const [similarBooks, reviewState] = await Promise.all([
    db
      .select()
      .from(books)
      .where(and(eq(books.genre, book.genre), ne(books.id, book.id)))
      .orderBy(desc(books.borrowCount), asc(books.title))
      .limit(SIMILAR_LIMIT),
    getReviewState(book.id, viewerId),
  ]);

  return (
    <BookDetail
      book={book}
      similarBooks={similarBooks}
      reviewState={reviewState}
      viewerId={viewerId}
    />
  );
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Kiểm tra sách tồn tại trước khi stream nội dung để 404 vẫn đúng status.
  await getBook(id);

  return (
    <main>
      <Suspense fallback={<PageLoader label="Loading book details…" />}>
        <BookDetailContent id={id} />
      </Suspense>
    </main>
  );
}

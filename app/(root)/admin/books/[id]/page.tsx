import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import BookEditor from "@/components/admin/BookEditor";
import { GENRES } from "@/database/books";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";

// Trang đọc dữ liệu sách theo `params` nên phải block trước khi trả lời để URL
// sai vẫn nhận đúng 404.
export const instant = false;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!UUID_RE.test(id)) return { title: "Admin Edit Book" };

  const [book] = await db
    .select({ title: books.title })
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  return { title: book ? `Edit ${book.title}` : "Admin Edit Book" };
}

const AdminEditBookPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    notFound();
  }

  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);

  if (!book) {
    notFound();
  }

  return <BookEditor mode="edit" book={book} genres={GENRES} />;
};

export default AdminEditBookPage;

import { Suspense } from "react";
import BookDetail from "@/components/books/BookDetail";
import { books } from "@/database/books";

export async function generateStaticParams() {
  return books.map((book) => ({
    id: book.id.toString(),
  }));
}

// 1. Tạo một component con chuyên xử lý async params và tìm sách
async function BookDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = books.find((b) => b.id.toString() === id);

  if (!book) {
    return (
      <div className="p-8 text-center text-[#62202f]">
        Không tìm thấy thông tin cuốn sách này!
      </div>
    );
  }

  return <BookDetail book={book} />;
}

// 2. Component chính chỉ làm nhiệm vụ bọc Suspense để thỏa mãn cơ chế cache của nhóm
export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main>
      <Suspense
        fallback={
          <div className="p-12 text-center text-[#62202f]">
            Đang tải dữ liệu sách...
          </div>
        }
      >
        <BookDetailLoader params={params} />
      </Suspense>
    </main>
  );
}

import { Suspense } from 'react';
import BookDetail from '@/components/books/BookDetail';
import { books } from '@/database/books';

export async function generateStaticParams() {
  return books.map((book) => ({
    id: book.id.toString(),
  }));
}

async function BookDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = books.find((b) => b.id.toString() === id);

  if (!book) {
    return <div className="p-8 text-center text-[#62202f]">Không tìm thấy thông tin cuốn sách này!</div>;
  }

  return <BookDetail book={book} />;
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<div className="p-12 text-center text-[#62202f]">Đang tải dữ liệu sách...</div>}>
        <BookDetailLoader params={params} />
      </Suspense>
    </main>
  );
}
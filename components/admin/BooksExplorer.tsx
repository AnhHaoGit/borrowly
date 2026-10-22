"use client"

import AdminSidebar from "@/components/admin/AdminSidebar";
import BookCard, { type Book } from "@/components/admin/BookCard";
import BookSearchBar from "@/components/admin/BookSearchBar";
import Pagination from "@/components/books/Pagination";

const books: Book[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  title: "Thunmanhandiya",
  subtitle: "Mahagamasekara",
  author: "Yamini Gowda",
  category: "fantasy",
  status: "Available",
  coverUrl: "/file.svg"
}));

//TODO: put in actual logic
const currentPage = 1;
const totalPage = 10;
const goToPage = (p: number) => {

};

const AdminBooksExplorer = () => {
    return (
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 md:px-10 md:py-8">
          <div className="mx-auto max-w-5xl">
            <BookSearchBar />

            <section aria-label="Books" className="mt-8 flex flex-col gap-4 sm:mt-12">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </section>

            <div className="mt-8">
              <Pagination
                current={currentPage}
                total={totalPage}
                onChange={goToPage}
              />
            </div>
          </div>
        </main>
      </div>
  );
};

export default AdminBooksExplorer;
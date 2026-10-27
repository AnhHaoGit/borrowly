"use client"

import AdminSidebar from "@/components/admin/AdminSidebar";
import BookCard from "@/components/admin/BookCard";
import BookSearchBar from "@/components/admin/BookSearchBar";
import Pagination from "@/components/books/Pagination";
import { type Book } from "@/types/book";

//Mock data
const books: Book[] = [
  {
    id: "404",
    title: "Title",
    authorName: "AuthorName",
    authorImageUrl: null,
    genre: "genre",
    publishYear: 3030,
    coverUrl: "",
    summary: "Summary",
    description: "Description",
    availableQuantity: 404,
    rating: 404,
    borrowCount: 404,
    language: "Language",
    subjects: ["Subject1", "Subject2"],
    subjectPlaces: ["SubjectPlaces1", "SubjectPlaces2"],
    subjectTimes: ["SubjectTimes1", "SubjectTimes2"],
    publishers: ["Publishers1", "Publishers2"],
    createdAt: new Date()
  }
];

//TODO: put in actual logic
const currentPage = 1;
const totalPage = 10;
const goToPage = (p: number) => {

};

const AdminBooksExplorer = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 space-y-6 px-4 pb-20 pt-8 sm:px-6">
          <h1 className="sr-only">Manage books</h1>

          <BookSearchBar />

          <section aria-label="Books" className="flex flex-col gap-4">
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
        </main>
      </div>
    </div>
  );
};

export default AdminBooksExplorer;
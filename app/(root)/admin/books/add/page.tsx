import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import type { Metadata } from "next";
import AddBookForm from "@/components/admin/AddBookForm";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: "Admin Add Books" };

// TODO: load the genre list from your database / shared constants instead
const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Romance",
  "History",
  "Poetry",
  "Biography",
  "Self-Help",
  "Kids",
  "Horror",
  "Philosophy",
  "Science",
  "Adventure",
  "Humor",
  "Fiction",
];

const AdminAddBookPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 space-y-6 px-4 pb-20 pt-8 sm:px-6">
          <div className="space-y-2">
            <Link
              href="/admin/books"
              className="inline-flex items-center gap-1.5 text-sm text-secondary transition hover:text-primary"
            >
              <LuArrowLeft className="size-4" />
              Back to books
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Add a new book</h1>
          </div>

          <AddBookForm genres={GENRES} />
        </main>
      </div>
    </div>
  );
};

export default AdminAddBookPage;

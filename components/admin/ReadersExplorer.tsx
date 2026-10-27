"use client"

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Pagination from "@/components/books/Pagination";
import ReaderCard from "@/components/admin/ReaderCard";
import { type Reader } from "@/types/reader";

// TODO: replace with real data (fetch from your API / database)
const readers: Reader[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  fullName: "Yamini Gowda",
  email: "yamini_gowda@home.com",
  role: "USER",
  lastActivityDate: null,
  createdAt: new Date()
}));

//TODO: add actual logic
const currentPage = 1;
const totalPage = 10;
const goToPage = (p: number) => {

};

const AdminReadersExplorer = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 space-y-6 px-4 pb-20 pt-8 sm:px-6">
          <h1 className="sr-only">Readers</h1>

          <AdminSearchBar />

          <section aria-label="Readers" className="flex flex-col gap-4">
            {readers.map((reader) => (
              <ReaderCard key={reader.id} reader={reader} />
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

export default AdminReadersExplorer;
"use client"

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Pagination from "@/components/books/Pagination";
import ReaderCard, { type Reader } from "@/components/admin/ReaderCard";

// TODO: replace with real data (fetch from your API / database)
const readers: Reader[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  name: "Yamini Gowda",
  email: "yamini_gowda@home.com",
  dateOfBirth: "Dec 18, 2020",
  phone: "(+91) 979839999",
  address: "Kisan Warle Est, Nr Dahanukar Wadi Bunder Pakhadi Rd, Kandivali, Alwar",
  avatarUrl: `/avatars/avatar-${i + 1}.png`, // put images in /public/avatars
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
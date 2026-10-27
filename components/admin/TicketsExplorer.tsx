"use client"

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Pagination from "@/components/books/Pagination";
import TicketsTable from "@/components/admin/TicketsTable";
import { type Ticket } from "@/types/ticket";

// TODO: replace with real data (fetch from your API / database)
const base = {
  id: "ticketId",
  readerId: "readerId",
  bookId: "bookId",
  borrowDate: null,
  dueDate: null,
  returnDate: null,
  createdAt: new Date()
};
const tickets: Ticket[] = [
  { ...base, id: "LBR123", status: "BORROWED" },
  { ...base, id: "LBR124", status: "PENDING" },
  { ...base, id: "LBR125", status: "RETURNED" },
  { ...base, id: "LBR126", status: "OVERDUE" },
  { ...base, id: "LBR127", status: "EXPIRED" },
];

//TODO: add actual logic
const currentPage = 1;
const totalPage = 10;
const goToPage = (p: number) => {

};

const AdminTicketsExplorer = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 space-y-6 px-4 pb-20 pt-8 sm:px-6">
          <h1 className="sr-only">Tickets</h1>

          <AdminSearchBar />

          <section aria-label="Tickets">
            <TicketsTable tickets={tickets} />
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

export default AdminTicketsExplorer;
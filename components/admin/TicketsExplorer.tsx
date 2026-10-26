"use client"

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Pagination from "@/components/books/Pagination";
import TicketsTable, { type Ticket } from "@/components/admin/TicketsTable";

// TODO: replace with real data (fetch from your API / database)
const base = {
  id: "LBR123",
  reader: "Thunmanhandiya",
  book: "101 cách cua đổ đại lão hàng xóm",
  borrowDate: "30/02/2027",
  dueDate: "07/03/2027",
};
const tickets: Ticket[] = [
  { ...base, id: "LBR123", status: { kind: "due-today" } },
  { ...base, id: "LBR124", status: { kind: "overdue" } },
  { ...base, id: "LBR125", status: { kind: "due-today" } },
  { ...base, id: "LBR126", status: { kind: "days-left", days: 3 } },
  { ...base, id: "LBR127", status: { kind: "days-left", days: 3 } },
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
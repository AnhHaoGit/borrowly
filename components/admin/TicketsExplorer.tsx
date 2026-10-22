"use client"

import { Alegreya, Inter } from "next/font/google";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Pagination from "@/components/books/Pagination";
import TicketsTable, { type Ticket } from "@/components/admin/TicketsTable";

const heading = Alegreya({ subsets: ["latin", "vietnamese"], weight: ["400", "700"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

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

export default function TicketExplorer() {
  return (
    <div
      className={`${heading.variable} ${body.variable} flex min-h-screen flex-col bg-[#FBF6E7] font-[family-name:var(--font-body)] text-[#5E1A2B]`}
    >
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 md:px-10 md:py-8">
          <div className="mx-auto max-w-5xl">
            <AdminSearchBar />

            <section aria-label="Tickets" className="mt-8 sm:mt-10">
              <TicketsTable tickets={tickets} />
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
    </div>
  );
}

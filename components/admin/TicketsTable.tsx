"use client";

import type { ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";

export type TicketStatus =
  | { kind: "due-today" }
  | { kind: "overdue" }
  | { kind: "days-left"; days: number };

export type Ticket = {
  id: string;
  reader: string;
  book: string;
  borrowDate: string;
  dueDate: string;
  status: TicketStatus;
};

const BORDER = "border-[#C98F93]";
// 6 columns on md+; on mobile each row becomes a stacked card
const GRID = "md:grid md:grid-cols-[0.9fr_1.1fr_1.4fr_1.2fr_1.1fr_1.5fr]";

function statusView(status: TicketStatus) {
  switch (status.kind) {
    case "due-today":
      return { label: "Due today", className: "text-[#F5B21B]" };
    case "overdue":
      return { label: "Over due", className: "text-[#E5322D]" };
    case "days-left":
      return { label: `${status.days} days left`, className: "text-[#3F7D3A]" };
  }
}

function Cell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="cell"
      className={`flex items-center justify-between gap-4 border-b border-[#EBD3CF] px-4 py-2.5 last:border-b-0 md:justify-center md:border-b-0 md:border-l md:px-3 md:py-6 md:text-center md:first:border-l-0 md:border-[#C98F93] ${className}`}
    >
      <span className="text-[11px] text-[#C98F93] md:hidden">{label}</span>
      <span className="min-w-0 break-words text-right md:text-center">{children}</span>
    </div>
  );
}

export default function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  const handleFilterStatus = () => {
    // TODO: open a dropdown to filter/sort by time status (due today, overdue, ...)
    console.log("filter by status");
  };

  const headers = ["Ticket ID", "Reader", "Book", "Borrow date", "Due date"];

  return (
    <div
      role="table"
      aria-label="Borrow tickets"
      className="font-[family-name:var(--font-heading)] text-[#3A1420]"
    >
      {/* Header row (desktop only) */}
      <div
        role="row"
        className={`hidden rounded-lg border bg-[#FBF6E7] text-xs uppercase tracking-wide ${BORDER} ${GRID}`}
      >
        {headers.map((h) => (
          <div
            key={h}
            role="columnheader"
            className={`px-3 py-2 text-center border-l first:border-l-0 ${BORDER}`}
          >
            {h}
          </div>
        ))}
        <div
          role="columnheader"
          className={`relative border-l px-3 py-2 text-center ${BORDER}`}
        >
          Time status
          <button
            type="button"
            onClick={handleFilterStatus}
            aria-label="Filter by time status"
            className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5CFC6] text-[#6B1D2E] hover:bg-[#EEB9AE]"
          >
            <FiChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Mobile-only filter button, since the header row is hidden */}
      <div className="mb-3 flex justify-end md:hidden">
        <button
          type="button"
          onClick={handleFilterStatus}
          className="flex items-center gap-1 rounded-full bg-[#F5CFC6] px-3 py-1 text-xs text-[#6B1D2E]"
        >
          Time status <FiChevronDown size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-4 md:mt-4">
        {tickets.map((t) => {
          const status = statusView(t.status);
          return (
            <div
              key={t.id}
              role="row"
              className={`flex flex-col overflow-hidden rounded-lg border shadow-md ${BORDER} ${GRID}`}
            >
              <Cell label="Ticket ID" className="text-base">{t.id}</Cell>
              <Cell label="Reader" className="text-xs font-bold text-[#6B1D2E]">
                {t.reader}
              </Cell>
              <Cell label="Book" className="text-[11px] uppercase leading-snug tracking-wide">
                {t.book}
              </Cell>
              <Cell label="Borrow date" className="text-[11px]">{t.borrowDate}</Cell>
              <Cell label="Due date" className="text-[11px]">{t.dueDate}</Cell>
              <Cell
                label="Time status"
                className={`text-xs font-bold uppercase tracking-wide ${status.className}`}
              >
                {status.label}
              </Cell>
            </div>
          );
        })}
      </div>
    </div>
  );
}

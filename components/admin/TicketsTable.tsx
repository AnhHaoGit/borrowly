"use client";

import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { notify } from "@/lib/toast";
import { type Ticket, type TicketWithDetails, type BorrowStatus } from "@/types/ticket";

interface Props {
  tickets: Ticket[];
}

// 6 columns on md+; on mobile each row becomes a stacked card
const GRID = "md:grid md:grid-cols-[0.9fr_1.1fr_1.4fr_1.2fr_1.1fr_1.5fr]";
const HEADERS = ["Ticket ID", "Reader", "Book", "Borrow date", "Due date"];

const statusView = (status: BorrowStatus) => {
  switch (status) {
    case "PENDING":
      return { label: "Pending", className: "bg-amber-100 text-amber-700" };
    case "BORROWED":
      return { label: "Borrowed", className: "bg-sky-100 text-sky-700" };
    case "RETURNED":
      return { label: "Returned", className: "bg-green-100 text-green-800" };
    case "OVERDUE":
      return { label: "Overdue", className: "bg-red-100 text-red-700" };
    case "EXPIRED":
      return { label: "Expired", className: "bg-orange-100 text-orange-700" };
    default:
      // Safety net for a value the app doesn't know about
      return { label: "Unknown", className: "bg-gray-200 text-gray-700" };
  }
};

interface CellProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const Cell = ({ label, children, className = "" }: CellProps) => (
  <div
    role="cell"
    className={`flex items-center justify-between gap-4 border-b border-accent-deep/20 px-4 py-2.5 last:border-b-0 md:justify-center md:border-b-0 md:border-l md:border-accent-deep/40 md:px-3 md:py-6 md:text-center md:first:border-l-0 ${className}`}
  >
    <span className="text-xs text-muted md:hidden">{label}</span>
    <span className="min-w-0 break-words text-right md:text-center">
      {children}
    </span>
  </div>
);

const TicketsTable = ({ tickets }: Props) => {
  const handleFilterStatus = () => {
    // TODO: open a dropdown to filter/sort by time status (due today, overdue, ...)
    notify.info("Status filter isn't connected yet");
  };

  return (
    <div role="table" aria-label="Borrow tickets" className="text-primary">
      {/* Header row (md+) */}
      <div
        role="row"
        className={`hidden overflow-hidden rounded-2xl border-2 border-accent-deep bg-accent text-sm font-bold ${GRID}`}
      >
        {HEADERS.map((h) => (
          <div
            key={h}
            role="columnheader"
            className="border-l border-accent-deep/40 px-3 py-3 text-center first:border-l-0"
          >
            {h}
          </div>
        ))}
        <div
          role="columnheader"
          className="relative border-l border-accent-deep/40 px-3 py-3 text-center"
        >
          Status
          <button
            type="button"
            onClick={handleFilterStatus}
            aria-label="Filter by time status"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-surface text-primary transition hover:bg-surface/70"
          >
            <LuChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile-only filter button, since the header row is hidden */}
      <div className="mb-3 flex justify-end md:hidden">
        <button
          type="button"
          onClick={handleFilterStatus}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-accent-deep bg-accent px-4 py-1.5 text-sm font-bold text-primary transition hover:bg-accent-deep"
        >
          Time status
          <LuChevronDown className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 md:mt-4">
        {tickets.map((t) => {
          const status = statusView(t.status);
          return (
            <div
              key={t.id}
              role="row"
              className={`flex flex-col overflow-hidden rounded-2xl border border-accent-deep/40 bg-surface shadow-soft ${GRID}`}
            >
              <Cell label="Ticket ID" className="text-base font-bold">
                {t.id}
              </Cell>
              <Cell label="Reader" className="text-sm font-bold">
                {/*t.reader*/"WIP"}
              </Cell>
              <Cell label="Book" className="text-sm leading-snug">
                {/*t.book*/"WIP"}
              </Cell>
              <Cell label="Borrow date" className="text-sm">
                {/*t.borrowDate*/"WIP"}
              </Cell>
              <Cell label="Due date" className="text-sm">
                {t.dueDate}
              </Cell>
              <Cell label="Time status">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                >
                  {status.label}
                </span>
              </Cell>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketsTable;

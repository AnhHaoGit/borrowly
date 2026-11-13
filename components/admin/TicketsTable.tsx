"use client";

import type { ReactNode } from "react";
import { LuChevronDown, LuLoader } from "react-icons/lu";
import { STATUS_ORDER, STATUS_VIEW } from "@/components/admin/ticket-status";
import LocalTimestamp from "@/components/ui/LocalTimestamp";
import { daysUntil, formatCalendarDate } from "@/lib/date";
import { getPickupDeadline } from "@/lib/receipts";
import type { BorrowStatus, TicketWithDetails } from "@/types/ticket";

interface Props {
  tickets: TicketWithDetails[];
  savingId: string | null;
  onStatusChange: (ticket: TicketWithDetails, status: BorrowStatus) => void;
}

// 6 cột trên md+; trên mobile mỗi dòng là một thẻ xếp dọc.
const GRID = "md:grid md:grid-cols-[0.8fr_1.3fr_1.6fr_1fr_1fr_1.2fr]";
const HEADERS = ["Receipt", "Reader", "Book", "Requested", "Deadline", "Status"];

const Cell = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div
    role="cell"
    className={`flex items-center justify-between gap-4 border-b border-accent-deep/20 px-4 py-2.5 last:border-b-0 md:justify-center md:border-b-0 md:border-l md:border-accent-deep/40 md:px-3 md:py-4 md:text-center md:first:border-l-0 ${className}`}
  >
    <span className="shrink-0 text-xs text-muted md:hidden">{label}</span>
    <span className="min-w-0 break-words text-right md:text-center">
      {children}
    </span>
  </div>
);

/**
 * Cột "Deadline": phiếu chờ nhận thì là hạn đến nhận (2 ngày), phiếu đã mượn
 * thì là hạn trả kèm số ngày còn lại / quá hạn.
 */
const deadlineView = (ticket: TicketWithDetails) => {
  if (ticket.status === "PENDING") {
    const deadline = getPickupDeadline(ticket.createdAt);
    const days = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);

    return {
      value: <LocalTimestamp value={deadline} />,
      note:
        days <= 0
          ? "Pickup window closing"
          : `Pick up in ${days} ${days === 1 ? "day" : "days"}`,
      danger: days <= 0,
    };
  }

  if (ticket.status === "RETURNED" || ticket.status === "EXPIRED") {
    return {
      value: ticket.returnDate ? formatCalendarDate(ticket.returnDate) : "—",
      note:
        ticket.status === "RETURNED" ? "Returned" : "Pickup window passed",
      danger: false,
    };
  }

  const days = daysUntil(ticket.dueDate);

  return {
    value: ticket.dueDate ? formatCalendarDate(ticket.dueDate) : "—",
    note:
      days === null
        ? ""
        : days < 0
          ? `${-days} ${-days === 1 ? "day" : "days"} overdue`
          : days === 0
            ? "Due today"
            : `${days} ${days === 1 ? "day" : "days"} left`,
    danger: days !== null && days <= 0,
  };
};

const TicketsTable = ({ tickets, savingId, onStatusChange }: Props) => {
  return (
    <div role="table" aria-label="Borrow tickets" className="text-primary">
      {/* Hàng tiêu đề (md+) */}
      <div
        role="row"
        className={`hidden overflow-hidden rounded-2xl border-2 border-accent-deep bg-accent text-sm font-bold md:grid ${GRID}`}
      >
        {HEADERS.map((header) => (
          <div
            key={header}
            role="columnheader"
            className="border-l border-accent-deep/40 px-3 py-3 text-center first:border-l-0"
          >
            {header}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:mt-4">
        {tickets.map((ticket) => {
          const deadline = deadlineView(ticket);
          const saving = savingId === ticket.id;

          return (
            <div
              key={ticket.id}
              role="row"
              className={`flex flex-col overflow-hidden rounded-2xl border border-accent-deep/40 bg-surface shadow-soft transition hover:border-accent-deep md:items-center ${GRID}`}
            >
              <Cell label="Receipt" className="text-sm font-bold">
                #{ticket.id.slice(0, 8)}
              </Cell>

              <Cell label="Reader">
                <span className="block truncate text-sm font-bold">
                  {ticket.reader.fullName}
                </span>
                <span className="block truncate text-xs text-muted">
                  {ticket.reader.email}
                </span>
              </Cell>

              <Cell label="Book">
                <span className="block line-clamp-2 text-sm font-bold leading-snug">
                  {ticket.book.title}
                </span>
                <span className="block truncate text-xs text-muted">
                  {ticket.book.authorName}
                </span>
              </Cell>

              <Cell label="Requested" className="text-sm">
                <LocalTimestamp value={ticket.createdAt} withTime />
              </Cell>

              <Cell label="Deadline" className="text-sm">
                <span className={deadline.danger ? "font-bold text-danger" : ""}>
                  {deadline.value}
                </span>
                {deadline.note && (
                  <span
                    className={`block text-xs ${
                      deadline.danger ? "text-danger" : "text-muted"
                    }`}
                  >
                    {deadline.note}
                  </span>
                )}
              </Cell>

              <Cell label="Status">
                <div className="relative w-full max-w-[11rem]">
                  <select
                    value={ticket.status}
                    disabled={saving}
                    onChange={(event) =>
                      onStatusChange(
                        ticket,
                        event.target.value as BorrowStatus,
                      )
                    }
                    aria-label={`Status for ${ticket.book.title}`}
                    className={`h-9 w-full cursor-pointer appearance-none rounded-full border px-3 pr-8 text-xs font-bold outline-none transition focus:ring-4 focus:ring-accent/60 disabled:cursor-wait disabled:opacity-70 ${STATUS_VIEW[ticket.status].badge}`}
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_VIEW[status].label}
                      </option>
                    ))}
                  </select>

                  {saving ? (
                    <LuLoader className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin" />
                  ) : (
                    <LuChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2" />
                  )}
                </div>
              </Cell>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketsTable;

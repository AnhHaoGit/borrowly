"use client";

import { useMemo, useState } from "react";
import { LuChevronDown, LuCircleAlert, LuSearch } from "react-icons/lu";
import {
  updateReceiptStatus,
  type ReceiptSnapshot,
} from "@/app/actions/admin-receipts";
import Pagination from "@/components/books/Pagination";
import TicketsTable from "@/components/admin/TicketsTable";
import { STATUS_ORDER, STATUS_VIEW } from "@/components/admin/ticket-status";
import { PageLoader } from "@/components/ui/Loader";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { getPickupDeadline } from "@/lib/receipts";
import { notify } from "@/lib/toast";
import type { BorrowStatus, TicketWithDetails } from "@/types/ticket";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | BorrowStatus;
type SortKey = "deadline" | "newest" | "oldest" | "reader";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "deadline", label: "Deadline (soonest first)" },
  { value: "newest", label: "Newest request" },
  { value: "oldest", label: "Oldest request" },
  { value: "reader", label: "Reader (A → Z)" },
];

const FIELD =
  "h-11 w-full rounded-xl border border-accent bg-background px-3 text-base text-primary outline-none transition placeholder:text-muted/60 focus:border-accent-deep focus:ring-4 focus:ring-accent/60";

// Mốc thời gian cần xử lý: hạn đến nhận với phiếu chờ, hạn trả với phiếu đã mượn.
const urgencyTime = (ticket: TicketWithDetails): number => {
  if (ticket.status === "PENDING") {
    return getPickupDeadline(ticket.createdAt).getTime();
  }

  if (ticket.dueDate) {
    return new Date(`${ticket.dueDate.slice(0, 10)}T00:00:00Z`).getTime();
  }

  return Number.POSITIVE_INFINITY;
};

const TicketsExplorer = () => {
  const { data, loading, error, reload } = useAdminFetch<{
    tickets: TicketWithDetails[];
  }>("/api/admin/tickets", "tickets");

  // Phiếu vừa đổi trạng thái được lưu đè lên dữ liệu tải về: bảng cập nhật ngay
  // cả ngày tháng mà server vừa ghi, không cần tải lại.
  const [updates, setUpdates] = useState<Record<string, ReceiptSnapshot>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("deadline");
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  const items: TicketWithDetails[] = useMemo(
    () =>
      (data?.tickets ?? []).map((ticket) =>
        updates[ticket.id] ? { ...ticket, ...updates[ticket.id] } : ticket,
      ),
    [data, updates],
  );

  const counts = useMemo(() => {
    const totals: Record<StatusFilter, number> = {
      ALL: items.length,
      PENDING: 0,
      BORROWED: 0,
      RETURNED: 0,
      OVERDUE: 0,
      EXPIRED: 0,
    };

    for (const ticket of items) totals[ticket.status] += 1;

    return totals;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const list = items.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;
      const matchesQuery =
        needle === "" ||
        ticket.id.toLowerCase().includes(needle) ||
        ticket.reader.fullName.toLowerCase().includes(needle) ||
        ticket.reader.email.toLowerCase().includes(needle) ||
        ticket.book.title.toLowerCase().includes(needle) ||
        ticket.book.authorName.toLowerCase().includes(needle);

      return matchesStatus && matchesQuery;
    });

    switch (sort) {
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "reader":
        return list.sort((a, b) =>
          a.reader.fullName.localeCompare(b.reader.fullName),
        );
      default:
        return list.sort(
          (a, b) =>
            urgencyTime(a) - urgencyTime(b) ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    }
  }, [items, query, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const handleStatusChange = async (
    ticket: TicketWithDetails,
    status: BorrowStatus,
  ) => {
    if (ticket.status === status) return;

    setSavingId(ticket.id);

    const result = await updateReceiptStatus(ticket.id, status);

    setSavingId(null);

    if (!result.success) {
      notify.error(result.message);
      return;
    }

    setUpdates((prev) => ({ ...prev, [ticket.id]: result.receipt }));

    notify.success("Status updated", {
      description: `${ticket.book.title} · ${STATUS_VIEW[status].label}`,
    });
  };

  const statusTabs: StatusFilter[] = ["ALL", ...STATUS_ORDER];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight text-primary md:text-4xl">
            Borrow tickets
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Every receipt in the library. Update a status when a reader picks up
            or returns a book.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-accent-deep/50 bg-accent px-4 py-2 text-sm text-primary">
          <LuCircleAlert className="size-4" />
          {counts.PENDING} waiting · {counts.OVERDUE} overdue
        </span>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-accent bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
        <LuCircleAlert className="mt-0.5 size-4 shrink-0 text-secondary" />
        <span>
          Pending tickets expire on their own 2 days after the request and put
          the copy back on the shelf. Borrowed tickets flip to overdue the day
          after their due date. Statuses you change here update stock
          immediately.
        </span>
      </p>

      <section
        aria-label="Filter tickets"
        className="space-y-4 rounded-2xl border border-accent bg-surface p-4 shadow-soft sm:p-5"
      >
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Filter by status"
        >
          {statusTabs.map((value) => {
            const active = statusFilter === value;
            const label = value === "ALL" ? "All" : STATUS_VIEW[value].label;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateFilter(() => setStatusFilter(value))}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
                  active
                    ? "border-secondary bg-accent font-bold text-primary"
                    : "border-accent bg-background text-secondary hover:bg-accent/50"
                }`}
              >
                {value !== "ALL" && (
                  <span
                    className={`size-2 rounded-full ${STATUS_VIEW[value].dot}`}
                  />
                )}
                {label}
                <span className="text-xs text-muted">{counts[value]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search tickets</span>
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary/70" />
            <input
              type="search"
              value={query}
              onChange={(event) =>
                updateFilter(() => setQuery(event.target.value))
              }
              placeholder="Search by reader, book or receipt id..."
              className="h-12 w-full rounded-2xl border border-accent bg-background pl-12 pr-4 text-base text-primary outline-none transition placeholder:text-muted/60 focus:border-accent-deep focus:ring-4 focus:ring-accent/60"
            />
          </label>

          <div className="relative sm:w-64">
            <select
              value={sort}
              onChange={(event) =>
                updateFilter(() => setSort(event.target.value as SortKey))
              }
              aria-label="Sort tickets"
              className={`${FIELD} cursor-pointer appearance-none pr-10`}
            >
              {SORTS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <LuChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-secondary" />
          </div>
        </div>
      </section>

      {error ? (
        <div className="space-y-3 rounded-2xl border border-danger/40 bg-surface px-6 py-12 text-center">
          <p className="text-muted">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="rounded-full border border-primary bg-primary px-5 py-2 text-sm text-background transition hover:bg-secondary"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <PageLoader label="Loading tickets…" />
      ) : (
        <>
          <p className="text-muted">
            {filtered.length === 0 ? (
              "0 tickets"
            ) : (
              <>
                Showing{" "}
                <b className="text-primary">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {(currentPage - 1) * PAGE_SIZE + visible.length}
                </b>{" "}
                of <b className="text-primary">{filtered.length}</b>{" "}
                {filtered.length === 1 ? "ticket" : "tickets"}
              </>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-accent-deep/60 bg-surface px-6 py-16 text-center">
              <p className="text-2xl font-bold text-secondary">
                No tickets found
              </p>
              <p className="mt-2 text-muted">
                Try another status, or clear the search.
              </p>
            </div>
          ) : (
            <TicketsTable
              tickets={visible}
              savingId={savingId}
              onStatusChange={handleStatusChange}
            />
          )}

          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default TicketsExplorer;

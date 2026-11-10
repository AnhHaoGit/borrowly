"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { LuChevronDown, LuSearch, LuUsers } from "react-icons/lu";
import { updateReaderRole } from "@/app/actions/admin-readers";
import Pagination from "@/components/books/Pagination";
import ReaderCard from "@/components/admin/ReaderCard";
import { PageLoader } from "@/components/ui/Loader";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { notify } from "@/lib/toast";
import type { ReaderWithStats, Role } from "@/types/reader";

const PAGE_SIZE = 10;

type RoleFilter = "all" | Role;
type SortKey = "newest" | "name" | "loans" | "oldest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name (A → Z)" },
  { value: "loans", label: "Most books on loan" },
  { value: "oldest", label: "Oldest first" },
];

const FIELD =
  "h-11 w-full rounded-xl border border-accent bg-background px-3 text-base text-primary outline-none transition placeholder:text-muted/60 focus:border-accent-deep focus:ring-4 focus:ring-accent/60";

const ReadersExplorer = () => {
  const { data, loading, error, reload } = useAdminFetch<{
    readers: ReaderWithStats[];
  }>("/api/admin/readers", "readers");

  // Quyền vừa đổi được lưu đè lên dữ liệu tải về, không cần tải lại cả danh sách.
  const [roleOverrides, setRoleOverrides] = useState<Record<string, Role>>({});
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const readers: ReaderWithStats[] = useMemo(
    () =>
      (data?.readers ?? []).map((reader) =>
        roleOverrides[reader.id]
          ? { ...reader, role: roleOverrides[reader.id] }
          : reader,
      ),
    [data, roleOverrides],
  );

  const counts = useMemo(
    () => ({
      all: readers.length,
      ADMIN: readers.filter((reader) => reader.role === "ADMIN").length,
      USER: readers.filter((reader) => reader.role === "USER").length,
    }),
    [readers],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const list = readers.filter((reader) => {
      const matchesRole = roleFilter === "all" || reader.role === roleFilter;
      const matchesQuery =
        needle === "" ||
        reader.fullName.toLowerCase().includes(needle) ||
        reader.email.toLowerCase().includes(needle);

      return matchesRole && matchesQuery;
    });

    switch (sort) {
      case "name":
        return list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      case "loans":
        return list.sort(
          (a, b) =>
            b.activeReceipts - a.activeReceipts ||
            a.fullName.localeCompare(b.fullName),
        );
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      default:
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [readers, query, roleFilter, sort]);

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

  const handleRoleChange = async (reader: ReaderWithStats, role: Role) => {
    if (reader.role === role) return;

    setPendingId(reader.id);

    const result = await updateReaderRole(reader.id, role);

    setPendingId(null);

    if (!result.success) {
      notify.error(result.message);
      return;
    }

    setRoleOverrides((prev) => ({ ...prev, [reader.id]: result.role }));

    notify.success(
      role === "ADMIN" ? "Admin access granted" : "Admin access removed",
      {
        description:
          role === "ADMIN"
            ? `${reader.email} can manage books and tickets after signing in again.`
            : `${reader.email} is a reader now.`,
      },
    );
  };

  const roleTabs: { value: RoleFilter; label: string; count: number }[] = [
    { value: "all", label: "Everyone", count: counts.all },
    { value: "ADMIN", label: "Admins", count: counts.ADMIN },
    { value: "USER", label: "Readers", count: counts.USER },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight text-primary md:text-4xl">
            Readers
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Everyone registered on Borrowly. Switch an account between reader
            and admin access.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-accent-deep/50 bg-accent px-4 py-2 text-sm text-primary">
          <LuUsers className="size-4" />
          {counts.all} {counts.all === 1 ? "person" : "people"}
        </span>
      </div>

      <section
        aria-label="Search and filter readers"
        className="rounded-2xl border border-accent bg-surface p-4 shadow-soft sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search readers</span>
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary/70" />
            <input
              type="search"
              value={query}
              onChange={(event) =>
                updateFilter(() => setQuery(event.target.value))
              }
              placeholder="Search by name or email..."
              className="h-12 w-full rounded-2xl border border-accent bg-background pl-12 pr-4 text-base text-primary outline-none transition placeholder:text-muted/60 focus:border-accent-deep focus:ring-4 focus:ring-accent/60"
            />
          </label>

          <div
            role="radiogroup"
            aria-label="Filter by access level"
            className="grid grid-cols-3 gap-1 rounded-xl border border-accent bg-background p-1"
          >
            {roleTabs.map(({ value, label, count }) => {
              const active = roleFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateFilter(() => setRoleFilter(value))}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm transition ${
                    active
                      ? "bg-accent font-bold text-primary shadow-sm"
                      : "text-secondary hover:bg-accent/40"
                  }`}
                >
                  {label}
                  <span className="text-xs text-muted">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative lg:w-56">
            <select
              value={sort}
              onChange={(event) =>
                updateFilter(() => setSort(event.target.value as SortKey))
              }
              aria-label="Sort readers"
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
        <PageLoader label="Loading readers…" />
      ) : (
        <>
          <p className="text-muted">
            {filtered.length === 0 ? (
              "0 people"
            ) : (
              <>
                Showing{" "}
                <b className="text-primary">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {(currentPage - 1) * PAGE_SIZE + visible.length}
                </b>{" "}
                of <b className="text-primary">{filtered.length}</b>{" "}
                {filtered.length === 1 ? "person" : "people"}
              </>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-accent-deep/60 bg-surface px-6 py-16 text-center">
              <p className="text-2xl font-bold text-secondary">
                No readers found
              </p>
              <p className="mt-2 text-muted">
                Try a different name, email or access level.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {visible.map((reader) => (
                <li key={reader.id}>
                  <ReaderCard
                    reader={reader}
                    isSelf={reader.id === currentUserId}
                    pending={pendingId === reader.id}
                    onChangeRole={handleRoleChange}
                  />
                </li>
              ))}
            </ul>
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

export default ReadersExplorer;

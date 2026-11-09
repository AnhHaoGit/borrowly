"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { deleteBook } from "@/app/actions/admin-books";
import FilterPanel from "@/components/books/FilterPanel";
import Pagination from "@/components/books/Pagination";
import SearchBar from "@/components/books/SearchBar";
import AdminBookCard from "@/components/admin/AdminBookCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PageLoader } from "@/components/ui/Loader";
import { notify } from "@/lib/toast";
import type { Book, Filters } from "@/types/book";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: Filters = {
  query: "",
  genres: [],
  yearMin: "",
  yearMax: "",
  status: "all",
  sort: "default",
};

interface BooksResponse {
  items: Book[];
  page: number;
  total: number;
  totalPages: number;
}

interface Props {
  genres: string[];
}

const AdminBooksExplorer = ({ genres }: Props) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const fetchBooks = useCallback(
    async (signal: AbortSignal) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("query", filters.query.trim());
      params.set("status", filters.status);
      params.set("sort", String(filters.sort));

      filters.genres.forEach((genre) => params.append("genre", genre));

      if (filters.yearMin !== "") params.set("yearMin", filters.yearMin);
      if (filters.yearMax !== "") params.set("yearMax", filters.yearMax);

      try {
        const response = await fetch(`/api/books?${params.toString()}`, {
          signal,
        });

        if (!response.ok) throw new Error("Unable to load books.");

        const data: BooksResponse = await response.json();

        if (signal.aborted) return;

        setBooks(data.items);
        setTotal(data.total);
        setTotalPages(Math.max(1, data.totalPages));
        setError(null);
      } catch {
        if (signal.aborted) return;

        setError("Failed to load books. Please try again.");
        setBooks([]);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    },
    [page, filters],
  );

  useEffect(() => {
    const controller = new AbortController();

    // Trì hoãn fetch sang microtask để tránh cập nhật state đồng bộ trong effect.
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        void fetchBooks(controller.signal);
      }
    });

    return () => controller.abort();
  }, [fetchBooks, reloadKey]);

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const toggleGenre = (genre: string) => {
    updateFilters({
      genres: filters.genres.includes(genre)
        ? filters.genres.filter((item) => item !== genre)
        : [...filters.genres, genre],
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const goToPage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    const result = await deleteBook(pendingDelete.id);

    setDeleting(false);

    if (!result.success) {
      notify.error(result.message);
      return;
    }

    notify.success("Book deleted", { description: pendingDelete.title });
    setPendingDelete(null);

    // Tải lại trang hiện tại để lấp chỗ trống sau khi xoá.
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight text-primary md:text-4xl">
            Manage books
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Search the catalogue, open a book to edit it, or remove it entirely.
          </p>
        </div>

        <Link
          href="/admin/books/add"
          className="inline-flex h-12 items-center gap-2 rounded-full border border-primary bg-primary px-6 text-base text-background transition hover:bg-secondary"
        >
          <LuPlus className="size-5" />
          Add book
        </Link>
      </div>

      <SearchBar
        value={filters.query}
        onChange={(query) => updateFilters({ query })}
      />

      <FilterPanel
        filters={filters}
        genres={genres}
        onChange={updateFilters}
        onToggleGenre={toggleGenre}
        onReset={resetFilters}
      />

      <div
        ref={resultsRef}
        className="flex scroll-mt-28 flex-wrap items-center justify-between gap-2 text-muted"
      >
        <p>
          {total === 0 ? (
            "0 books"
          ) : (
            <>
              Showing{" "}
              <b className="text-primary">
                {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + books.length}
              </b>{" "}
              of <b className="text-primary">{total}</b> books
            </>
          )}
        </p>
      </div>

      {error ? (
        <div className="space-y-3 py-8 text-center">
          <p>{error}</p>
          <button
            type="button"
            className="rounded-lg border px-4 py-2"
            onClick={() => {
              setIsLoading(true);
              setReloadKey((key) => key + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <PageLoader label="Loading books..." />
      ) : books.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-accent-deep/60 bg-surface px-6 py-16 text-center">
          <p className="text-2xl font-bold text-secondary">No books found</p>
          <p className="mt-2 text-muted">
            Try changing the search or loosening the filters.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <li key={book.id}>
              <AdminBookCard book={book} onDelete={setPendingDelete} />
            </li>
          ))}
        </ul>
      )}

      <Pagination current={page} total={totalPages} onChange={goToPage} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this book?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed from the catalogue. This can't be undone.`
            : ""
        }
        confirmLabel="Delete book"
        pending={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default AdminBooksExplorer;

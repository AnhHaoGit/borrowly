"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import BookGrid from "./BookGrid";
import Pagination from "./Pagination";
import { PageLoader } from "@/components/ui/Loader";
import { BORROW_LIMIT } from "@/lib/receipts";
import type { Book, Filters } from "../../types/book";
import type { BorrowStatus } from "@/types/ticket";
import { useSession } from "next-auth/react";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: Filters = {
  query: "",
  genres: [],
  yearMin: "",
  yearMax: "",
  status: "all",
  sort: "default",
};

interface Props {
  genres: string[];
}

interface BooksResponse {
  items: Book[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  borrowStates?: Record<string, BorrowStatus>;
  activeBorrowCount?: number;
}

const BooksExplorer = ({ genres }: Props) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái phiếu người xem đang giữ, do API trả về cùng danh sách sách.
  const [borrowStates, setBorrowStates] = useState<
    Record<string, BorrowStatus>
  >({});
  const [activeBorrowCount, setActiveBorrowCount] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);
  const { data, status } = useSession();

  const user = data?.user;

  console.log("BooksExplorer user:", user);

  const isAuthenticated = status === "authenticated";
  const borrowLimitReached = activeBorrowCount >= BORROW_LIMIT;

  const fetchBooks = useCallback(
    async (signal: AbortSignal) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("query", filters.query.trim());
      params.set("status", filters.status);
      params.set("sort", String(filters.sort));

      filters.genres.forEach((genre) => {
        params.append("genre", genre);
      });

      if (filters.yearMin !== "") {
        params.set("yearMin", filters.yearMin);
      }

      if (filters.yearMax !== "") {
        params.set("yearMax", filters.yearMax);
      }

      try {
        const response = await fetch(`/api/books?${params.toString()}`, {
          signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load books.");
        }

        const data: BooksResponse = await response.json();

        if (signal.aborted) return;

        setBooks(data.items);
        setTotal(data.total);
        setTotalPages(Math.max(1, data.totalPages));
        setBorrowStates(data.borrowStates ?? {});
        setActiveBorrowCount(data.activeBorrowCount ?? 0);
        setError(null);
      } catch (err) {
        if (signal.aborted) return;

        setError("Failed to load books. Please try again.");
        setBooks([]);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [page, filters],
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    const controller = new AbortController();

    // Trì hoãn fetch sang microtask để tránh cập nhật state
    // đồng bộ ngay trong lúc effect chạy.
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        void fetchBooks(controller.signal);
      }
    });

    return () => controller.abort();
  }, [status, fetchBooks]);

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const toggleGenre = (genre: string) => {
    updateFilters({
      genres: filters.genres.includes(genre)
        ? filters.genres.filter((g) => g !== genre)
        : [...filters.genres, genre],
    });
  };

  // Cập nhật tại chỗ ngay khi tạo phiếu xong: nút chuyển sang Pending pickup và
  // số lượng khả dụng giảm một, không cần tải lại cả danh sách.
  const handleBorrowed = (id: string) => {
    setBorrowStates((prev) => ({ ...prev, [id]: "PENDING" }));
    setActiveBorrowCount((prev) => prev + 1);
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? {
              ...book,
              availableQuantity: Math.max(0, book.availableQuantity - 1),
            }
          : book,
      ),
    );
  };

  const goToPage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  if (status === "loading" || status === "unauthenticated") {
    return <PageLoader label="Loading your library…" />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-20 pt-8 sm:px-6">
      <h1 className="sr-only">Books</h1>

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
                {(page - 1) * PAGE_SIZE + 1}–
                {(page - 1) * PAGE_SIZE + books.length}
              </b>{" "}
              of <b className="text-primary">{total}</b> books
            </>
          )}
        </p>

        <p
          className={`rounded-full px-3 py-1 text-sm ${
            borrowLimitReached
              ? "bg-danger/10 font-bold text-danger"
              : "bg-accent text-primary"
          }`}
        >
          {activeBorrowCount} / {BORROW_LIMIT} books borrowed
        </p>
      </div>

      {error ? (
        <div className="space-y-3 py-8 text-center">
          <p>{error}</p>
          <button
            className="rounded-lg border px-4 py-2"
            onClick={() => {
              const controller = new AbortController();
              void fetchBooks(controller.signal);
            }}
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <PageLoader label="Loading books..." />
      ) : (
        <BookGrid
          books={books}
          borrowStates={borrowStates}
          borrowLimitReached={borrowLimitReached}
          isAuthenticated={isAuthenticated}
          onBorrowed={handleBorrowed}
        />
      )}

      <Pagination current={page} total={totalPages} onChange={goToPage} />
    </div>
  );
};

export default BooksExplorer;

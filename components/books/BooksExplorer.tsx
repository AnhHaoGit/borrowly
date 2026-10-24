"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import BookGrid from "./BookGrid";
import Pagination from "./Pagination";
import { PageLoader } from "@/components/ui/Loader";
import { notify } from "@/lib/toast";
import type { Book, Filters } from "../../types/book";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
}

const BooksExplorer = ({ genres }: Props) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [borrowedIds, setBorrowedIds] = useState<Set<string>>(new Set());

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      notify.info("Please sign in to browse books.", {
        id: "auth-required",
      });
      router.replace("/sign-in");
    }
  }, [status, router]);

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

  const toggleBorrow = (id: string) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;

    const adding = !borrowedIds.has(id);

    setBorrowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (adding) {
      notify.success("Added to your borrow list", {
        description: book.title,
      });
    } else {
      notify.info("Removed from your borrow list", {
        description: book.title,
      });
    }
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
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-20 pt-8 sm:px-6">
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

        {borrowedIds.size > 0 && (
          <p className="rounded-full bg-accent px-3 py-1 text-sm text-primary">
            {borrowedIds.size} {borrowedIds.size === 1 ? "book" : "books"} to
            borrow
          </p>
        )}
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
          borrowedIds={borrowedIds}
          onToggleBorrow={toggleBorrow}
        />
      )}

      <Pagination current={page} total={totalPages} onChange={goToPage} />
    </div>
  );
};

export default BooksExplorer;

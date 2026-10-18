"use client";

import { useMemo, useRef, useState, useEffect } from "react";

import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import BookGrid from "./BookGrid";
import Pagination from "./Pagination";
import { PageLoader } from "@/components/ui/Loader";
import { PAGE_SIZE, SORTERS } from "../../lib/books";
import { notify } from "@/lib/toast";
import type { Book, Filters } from "../../types/book";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEFAULT_FILTERS: Filters = {
  query: "",
  genres: [],
  yearMin: "",
  yearMax: "",
  status: "all",
  sort: "default",
};

interface Props {
  books: Book[];
  genres: string[];
}

const BooksExplorer = ({ books, genres }: Props) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [borrowedIds, setBorrowedIds] = useState<Set<number>>(new Set());
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      notify.info("Please sign in to browse books.", { id: "auth-required" });
      router.replace("/sign-in");
    }
  }, [status, router]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const min = filters.yearMin === "" ? -Infinity : Number(filters.yearMin);
    const max = filters.yearMax === "" ? Infinity : Number(filters.yearMax);

    return books
      .filter((b) => {
        const matchQuery =
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.author_name.toLowerCase().includes(q);
        const matchGenre =
          filters.genres.length === 0 || filters.genres.includes(b.genre);
        const matchYear =
          b.publish_year === null
            ? filters.yearMin === "" && filters.yearMax === ""
            : b.publish_year >= min && b.publish_year <= max;
        const inStock = b.available_quantity > 0;
        const matchStatus =
          filters.status === "all" ||
          (filters.status === "available" ? inStock : !inStock);
        return matchQuery && matchGenre && matchYear && matchStatus;
      })
      .sort(SORTERS[filters.sort]);
  }, [books, filters]); // tác dụng của useMemo: chỉ recompute khi books hoặc filters thay đổi

  // Đang kiểm tra phiên, hoặc đang chuyển hướng vì chưa đăng nhập: hiện loader thay vì nháy giao diện sách
  if (status === "loading") {
    return <PageLoader label="Loading your library…" />;
  }
  if (status === "unauthenticated") {
    return <PageLoader label="Taking you to sign in…" />;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Đổi bộ lọc thì về trang 1
  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const toggleGenre = (genre: string) =>
    updateFilters({
      genres: filters.genres.includes(genre)
        ? filters.genres.filter((g) => g !== genre)
        : [...filters.genres, genre],
    });

  const toggleBorrow = (id: number) => {
    const book = books.find((b) => b.id === id);
    const adding = !borrowedIds.has(id);

    setBorrowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (!book) return;
    if (adding) {
      notify.success("Added to your borrow list", { description: book.title });
    } else {
      notify.info("Removed from your borrow list", { description: book.title });
    }
  };

  const goToPage = (p: number) => {
    setPage(p);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

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
          {filtered.length === 0 ? (
            "0 books"
          ) : (
            <>
              Showing{" "}
              <b className="text-primary">
                {startIndex + 1}–{startIndex + visible.length}
              </b>{" "}
              of <b className="text-primary">{filtered.length}</b> books
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

      <BookGrid
        books={visible}
        borrowedIds={borrowedIds}
        onToggleBorrow={toggleBorrow}
      />

      <Pagination
        current={currentPage}
        total={totalPages}
        onChange={goToPage}
      />
    </div>
  );
};

export default BooksExplorer;

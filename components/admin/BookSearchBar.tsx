"use client";

import { useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import { notify } from "@/lib/toast";

const BookSearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: run the search (update URL params / call your API) using `query`
    notify.info("Search isn't connected yet", { description: query });
  };

  const handleAddBook = () => {
    // TODO: open the "Add book" modal or navigate to /admin/books/new
    notify.info("Add book isn't connected yet");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border-2 border-accent-deep bg-linear-to-r from-surface from-45% to-accent px-4 shadow-soft focus-within:ring-2 focus-within:ring-primary/30">
          <LuSearch className="size-5 shrink-0 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ..."
            className="w-full min-w-0 bg-transparent text-base text-primary placeholder:text-muted focus:outline-none"
          />
        </label>
      </form>

      <button
        type="button"
        onClick={handleAddBook}
        className="ml-auto inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base text-background transition hover:bg-secondary"
      >
        <LuPlus className="size-5" />
        Add book
      </button>
    </div>
  );
};

export default BookSearchBar;

"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function BookSearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: run the search (update URL params / call your API) using `query`
    console.log("search:", query);
  };

  const handleAddBook = () => {
    // TODO: open the "Add book" modal or navigate to /admin/books/new
    console.log("add book");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-md sm:flex-none sm:basis-[22rem]"
      >
        <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg bg-gradient-to-r from-white from-45% to-[#F5CFC6] px-3 shadow-sm">
          <FiSearch className="shrink-0 text-[#8FA3C4]" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ..."
            className="w-full min-w-0 bg-transparent text-sm text-[#5E1A2B] placeholder:text-[#A9A9B3] focus:outline-none"
          />
        </label>
      </form>

      <button
        type="button"
        onClick={handleAddBook}
        className="ml-auto h-10 rounded-full bg-[#6B1D2E] px-6 text-xs text-[#F9E3DE] transition-colors hover:bg-[#561624]"
      >
        Add book
      </button>
    </div>
  );
}

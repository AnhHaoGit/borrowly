"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";

// Same search + voice button as BookSearchBar, without the "Add book" button.
export default function AdminSearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: run the search (update URL params / call your API) using `query`
    console.log("search:", query);
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="mx-auto flex w-full max-w-md items-center gap-3"
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
  );
}

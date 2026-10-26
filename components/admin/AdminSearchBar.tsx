"use client";

import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { notify } from "@/lib/toast";

// Search button (no "Add" button) for the Readers and Tickets pages
const AdminSearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: run the search (update URL params / call your API) using `query`
    notify.info("Search isn't connected yet", { description: query });
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="mx-auto flex w-full max-w-xl items-center gap-3"
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
  );
};

export default AdminSearchBar;

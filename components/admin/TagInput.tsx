"use client";

import { useState } from "react";
import { LuX } from "react-icons/lu";

interface Props {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  max: number;
  placeholder?: string;
}

// Type a value and press Enter or comma to add it as a chip
const TagInput = ({ id, values, onChange, max, placeholder }: Props) => {
  const [draft, setDraft] = useState("");
  const full = values.length >= max;

  const commit = () => {
    const text = draft.trim();
    if (!text) return;
    const exists = values.some((v) => v.toLowerCase() === text.toLowerCase());
    if (!exists && !full && text.length <= 100) onChange([...values, text]);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-accent-deep/60 bg-background p-2 focus-within:ring-2 focus-within:ring-primary/30">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-3 pr-1.5 text-sm text-primary"
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter((v) => v !== value))}
              className="grid size-5 place-items-center rounded-full transition hover:bg-accent-deep"
            >
              <LuX className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          disabled={full}
          placeholder={full ? "Limit reached" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-2 py-1 text-base text-primary placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-1 text-xs text-muted">
        {values.length}/{max} · Press Enter or comma to add
      </p>
    </div>
  );
};

export default TagInput;
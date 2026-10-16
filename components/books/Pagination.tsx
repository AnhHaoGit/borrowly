import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface Props {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

// Ví dụ: 1 … 4 5 6 … 25
const getPageItems = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);

  return items;
};

const arrowClass =
  "grid size-9 place-items-center rounded-full text-primary transition hover:bg-surface/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

const Pagination = ({ current, total, onChange }: Props) => {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mx-auto flex w-fit max-w-full items-center gap-1 rounded-full border border-accent-deep/60 bg-accent px-2 py-2 shadow-soft"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className={arrowClass}
      >
        <LuChevronLeft className="size-5" />
      </button>

      {getPageItems(current, total).map((item, i) =>
        item === "…" ? (
          <span key={`dots-${i}`} className="px-1 text-primary/60">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === current ? "page" : undefined}
            onClick={() => onChange(item)}
            className={`grid size-9 place-items-center rounded-full text-sm transition ${
              item === current
                ? "bg-secondary font-bold text-background"
                : "text-primary hover:bg-surface/70"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className={arrowClass}
      >
        <LuChevronRight className="size-5" />
      </button>
    </nav>
  );
};

export default Pagination;

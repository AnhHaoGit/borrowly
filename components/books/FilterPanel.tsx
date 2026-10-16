import { LuCheck, LuChevronDown, LuRotateCcw, LuSlidersHorizontal } from "react-icons/lu";
import type { Filters, SortKey, Status } from "@/types/book";

interface Props {
  filters: Filters;
  genres: string[];
  onChange: (patch: Partial<Filters>) => void;
  onToggleGenre: (genre: string) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "In stock" },
  { value: "unavailable", label: "Out of stock" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Most relevant" },
  { value: "title", label: "Title (A → Z)" },
  { value: "year-desc", label: "Newest first" },
  { value: "year-asc", label: "Oldest first" },
];

const FIELD =
  "h-11 w-full rounded-xl border border-accent bg-background px-3 text-base text-primary outline-none transition placeholder:text-muted/50 focus:border-accent-deep focus:ring-4 focus:ring-accent/60";

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-secondary">
    {children}
  </span>
);

const Chip = ({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={checked}
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-base transition ${
      checked
        ? "border-secondary bg-accent font-bold text-primary"
        : "border-accent bg-background text-secondary hover:bg-accent/50"
    }`}
  >
    <span
      className={`grid size-4 place-items-center rounded-[4px] border-2 border-secondary transition ${
        checked ? "bg-secondary text-background" : "bg-transparent"
      }`}
    >
      {checked && <LuCheck className="size-3" strokeWidth={4} />}
    </span>
    {label}
  </button>
);

const FilterPanel = ({
  filters,
  genres,
  onChange,
  onToggleGenre,
  onReset,
}: Props) => {
  const invalidRange =
    filters.yearMin !== "" &&
    filters.yearMax !== "" &&
    Number(filters.yearMin) > Number(filters.yearMax);

  return (
    <section
      aria-label="Filters"
      className="rounded-2xl border border-accent bg-surface p-5 shadow-soft sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-secondary">
          <LuSlidersHorizontal className="size-5" /> Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-secondary transition hover:bg-accent/50 hover:text-primary"
        >
          <LuRotateCcw className="size-4" /> Reset
        </button>
      </div>

      {/* Thể loại */}
      <div role="group" aria-label="Filter by genre">
        <Label>Genre</Label>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="All"
            checked={filters.genres.length === 0}
            onClick={() => onChange({ genres: [] })}
          />
          {genres.map((genre) => (
            <Chip
              key={genre}
              label={genre}
              checked={filters.genres.includes(genre)}
              onClick={() => onToggleGenre(genre)}
            />
          ))}
        </div>
      </div>

      <hr className="my-6 border-accent" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label>Publication year</Label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              aria-label="From year"
              placeholder="From"
              value={filters.yearMin}
              onChange={(e) => onChange({ yearMin: e.target.value })}
              className={FIELD}
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              inputMode="numeric"
              aria-label="To year"
              placeholder="To"
              value={filters.yearMax}
              onChange={(e) => onChange({ yearMax: e.target.value })}
              className={FIELD}
            />
          </div>
          {invalidRange && (
            <p className="mt-2 text-sm text-secondary">
              “From” must be less than or equal to “To”.
            </p>
          )}
        </div>

        {/* Trạng thái */}
        <div>
          <Label>Availability</Label>
          <div
            role="radiogroup"
            aria-label="Availability"
            className="grid grid-cols-3 gap-1 rounded-xl border border-accent bg-background p-1"
          >
            {STATUS_OPTIONS.map(({ value, label }) => {
              const active = filters.status === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ status: value })}
                  className={`h-9 rounded-lg px-2 text-sm transition ${
                    active
                      ? "bg-accent font-bold text-primary shadow-sm"
                      : "text-secondary hover:bg-accent/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sắp xếp */}
        <div className="md:col-span-2 lg:col-span-1">
          <Label>Sort by</Label>
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortKey })}
              aria-label="Sort books"
              className={`${FIELD} cursor-pointer appearance-none pr-10`}
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <LuChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterPanel;

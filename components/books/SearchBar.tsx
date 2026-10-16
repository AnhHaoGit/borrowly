import { LuSearch } from "react-icons/lu";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: Props) => {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <LuSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary/70" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or author..."
        aria-label="Search books"
        className="h-13 w-full rounded-2xl border border-accent bg-linear-to-r from-surface via-surface to-accent/80 pl-12 pr-4 text-lg text-primary shadow-soft outline-none transition placeholder:text-muted/60 focus:border-accent-deep focus:ring-4 focus:ring-accent/60"
      />
    </div>
  );
};

export default SearchBar;

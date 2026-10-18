type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  label?: string;
  size?: LoaderSize;
  className?: string;
}

const BOOKS = [
  { w: 12, h: 34, color: "bg-primary" },
  { w: 14, h: 46, color: "bg-secondary" },
  { w: 11, h: 30, color: "bg-accent-deep" },
  { w: 14, h: 42, color: "bg-primary" },
  { w: 12, h: 36, color: "bg-secondary" },
] as const;

const SCALE: Record<LoaderSize, number> = { sm: 0.55, md: 1, lg: 1.4 };
const STAGGER_MS = 120;

const Loader = ({ label, size = "md", className = "" }: LoaderProps) => {
  const scale = SCALE[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex flex-col items-center gap-4 ${className}`}
    >
      <div>
        <div className="flex items-end gap-1.5" aria-hidden="true">
          {BOOKS.map((book, i) => (
            <span
              key={i}
              className={`block rounded-t-sm ${book.color} animate-[book-bounce_1.1s_ease-in-out_infinite] motion-reduce:animate-none`}
              style={{
                width: book.w * scale,
                height: book.h * scale,
                animationDelay: `${i * STAGGER_MS}ms`,
              }}
            />
          ))}
        </div>
        {/* ván kệ */}
        <div
          className="h-1.5 w-full rounded-full bg-primary"
          aria-hidden="true"
        />
      </div>

      {label ? (
        <p
          className={`text-secondary ${size === "sm" ? "text-sm" : "text-lg"}`}
        >
          {label}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
};

export const PageLoader = ({ label = "Loading…" }: { label?: string }) => {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-6xl items-center justify-center px-4 py-16">
      <Loader size="lg" label={label} />
    </div>
  );
};

export default Loader;

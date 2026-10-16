import Image from "next/image";
import { LuBookmarkPlus, LuBookOpen, LuCheck } from "react-icons/lu";
import { coverUrl } from "../../lib/books";
import type { Book } from "../../types/book";

interface Props {
  book: Book;
  borrowed: boolean;
  onToggle: (id: number) => void;
}

const BookCard = ({ book, borrowed, onToggle }: Props) => {
  const remaining = book.available_quantity - (borrowed ? 1 : 0);
  const outOfStock = book.available_quantity <= 0;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-accent bg-surface p-4 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* Cover */}
      <div className="relative mx-auto aspect-2/3 w-full max-w-[180px] overflow-hidden rounded-lg bg-accent/40 shadow-md ring-1 ring-primary/10">
        {book.cover_id ? (
          <Image
            src={coverUrl(book.cover_id)}
            alt={`Cover of ${book.title}`}
            fill
            unoptimized
            sizes="180px"
            className={`object-cover transition duration-500 group-hover:scale-105 ${
              outOfStock ? "opacity-70 grayscale-[40%]" : ""
            }`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-secondary">
            <LuBookOpen className="size-8" />
            <span className="line-clamp-4 text-sm">{book.title}</span>
          </div>
        )}
        <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-full bg-background/90 px-2.5 py-0.5 text-xs text-secondary backdrop-blur">
          {book.genre}
        </span>
      </div>

      {/* Info */}
      <div className="mt-4 flex-1">
        <h3
          title={book.title}
          className="line-clamp-2 min-h-[2.7em] text-lg font-bold leading-snug text-primary"
        >
          {book.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-secondary">
          {book.author_name}
          {book.publish_year ? ` · ${book.publish_year}` : ""}
        </p>

        {book.summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-snug text-muted">
            {book.summary}
          </p>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <span
            className={`size-2 shrink-0 rounded-full ${remaining > 0 ? "bg-emerald-500" : "bg-accent-deep"}`}
          />
          {remaining > 0
            ? `${remaining} ${remaining === 1 ? "copy" : "copies"} available`
            : outOfStock
              ? "Currently out of stock"
              : "All copies reserved"}
        </p>
      </div>

      {/* Action */}
      <button
        type="button"
        disabled={outOfStock}
        aria-pressed={borrowed}
        onClick={() => onToggle(book.id)}
        className={`mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border text-sm transition ${
          outOfStock
            ? "cursor-not-allowed border-accent bg-accent/30 text-muted/70"
            : borrowed
              ? "border-primary bg-primary text-background"
              : "border-secondary text-secondary hover:bg-accent hover:text-primary"
        }`}
      >
        {outOfStock ? (
          "Unavailable"
        ) : borrowed ? (
          <>
            <LuCheck className="size-4" /> Borrowed
          </>
        ) : (
          <>
            <LuBookmarkPlus className="size-4" /> Borrow
          </>
        )}
      </button>
    </article>
  );
};

export default BookCard;

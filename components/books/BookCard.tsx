import Image from "next/image";
import Link from "next/link";
import { LuBookOpen } from "react-icons/lu";
import BorrowButton from "./BorrowButton";
import type { Book } from "../../types/book";
import type { BorrowStatus } from "@/types/ticket";

interface Props {
  book: Book;
  borrowStatus: BorrowStatus | null;
  borrowLimitReached: boolean;
  isAuthenticated: boolean;
  onBorrowed?: (id: string) => void;
}

const BookCard = ({
  book,
  borrowStatus,
  borrowLimitReached,
  isAuthenticated,
  onBorrowed,
}: Props) => {
  const available = book.availableQuantity > 0;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-accent bg-surface p-4 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link
        href={`/books/${book.id}`}
        className="flex flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        {/* Cover */}
        <div className="relative mx-auto aspect-2/3 w-full max-w-45 overflow-hidden rounded-lg bg-accent/40 shadow-md ring-1 ring-primary/10">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(max-width: 768px) 80vw, 180px"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
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
            className="line-clamp-2 min-h-[2.7em] text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary"
          >
            {book.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-secondary">
            {book.authorName}
            {book.publishYear ? ` · ${book.publishYear}` : ""}
          </p>

          {book.summary && (
            <p className="mt-2 line-clamp-3 text-sm leading-snug text-muted">
              {book.summary}
            </p>
          )}

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <span
              className={`size-2 shrink-0 rounded-full ${available ? "bg-emerald-500" : "bg-accent-deep"}`}
            />
            {available
              ? `${book.availableQuantity} ${book.availableQuantity === 1 ? "copy" : "copies"} available`
              : "Currently out of stock"}
          </p>
        </div>
      </Link>

      {/* Action */}
      <BorrowButton
        bookId={book.id}
        bookTitle={book.title}
        status={borrowStatus}
        available={available}
        limitReached={borrowLimitReached}
        isAuthenticated={isAuthenticated}
        label="Borrow"
        className="mt-4"
        onBorrowed={onBorrowed}
      />
    </article>
  );
};

export default BookCard;

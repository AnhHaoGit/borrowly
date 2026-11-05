import BookCard from "./BookCard";
import type { Book } from "@/types/book";
import type { BorrowStatus } from "@/types/ticket";

interface Props {
  books: Book[];
  borrowStates: Record<string, BorrowStatus>;
  borrowLimitReached: boolean;
  isAuthenticated: boolean;
  onBorrowed?: (id: string) => void;
}

const BookGrid = ({
  books,
  borrowStates,
  borrowLimitReached,
  isAuthenticated,
  onBorrowed,
}: Props) => {
  if (books.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-accent-deep/60 bg-surface px-6 py-16 text-center">
        <p className="text-2xl font-bold text-secondary">No books found</p>
        <p className="mt-2 text-muted">
          Try changing your search or loosening the filters.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard
            book={book}
            borrowStatus={borrowStates[book.id] ?? null}
            borrowLimitReached={borrowLimitReached}
            isAuthenticated={isAuthenticated}
            onBorrowed={onBorrowed}
          />
        </li>
      ))}
    </ul>
  );
};

export default BookGrid;

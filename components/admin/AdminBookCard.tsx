"use client";

import Image from "next/image";
import Link from "next/link";
import { canOptimizeImage } from "@/lib/images";
import { LuBookOpen, LuPencil, LuTrash2 } from "react-icons/lu";
import type { Book } from "@/types/book";

interface Props {
  book: Book;
  onDelete: (book: Book) => void;
}

const AdminBookCard = ({ book, onDelete }: Props) => {
  const available = book.availableQuantity > 0;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-accent bg-surface p-4 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* Sửa / xoá ngay trên thẻ sách */}
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <Link
          href={`/admin/books/${book.id}`}
          aria-label={`Edit ${book.title}`}
          title="Edit book"
          className="grid size-9 place-items-center rounded-full border border-accent-deep/60 bg-surface/95 text-primary shadow-soft transition hover:bg-primary hover:text-background"
        >
          <LuPencil className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(book)}
          aria-label={`Delete ${book.title}`}
          title="Delete book"
          className="grid size-9 place-items-center rounded-full border border-accent-deep/60 bg-surface/95 text-primary shadow-soft transition hover:bg-danger hover:text-white"
        >
          <LuTrash2 className="size-4" />
        </button>
      </div>

      {/* Ấn vào thẻ để mở trang chi tiết/sửa */}
      <Link
        href={`/admin/books/${book.id}`}
        className="flex flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        <div className="relative mx-auto aspect-2/3 w-full max-w-45 overflow-hidden rounded-lg bg-accent/40 shadow-md ring-1 ring-primary/10">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              unoptimized={!canOptimizeImage(book.coverUrl)}
              sizes="(max-width: 768px) 80vw, 180px"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-secondary">
              <LuBookOpen className="size-8" />
              <span className="line-clamp-4 text-sm">{book.title}</span>
            </div>
          )}
          <span className="absolute left-2 bottom-2 max-w-[85%] truncate rounded-full bg-background/90 px-2.5 py-0.5 text-xs text-secondary backdrop-blur">
            {book.genre}
          </span>
        </div>

        <div className="mt-4 flex-1">
          <h3
            title={book.title}
            className="line-clamp-2 min-h-[2.7em] pr-16 text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary"
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
    </article>
  );
};

export default AdminBookCard;

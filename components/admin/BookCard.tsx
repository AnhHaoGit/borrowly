"use client";

import Image from "next/image";
import { LuTrash2 } from "react-icons/lu";
import { notify } from "@/lib/toast";
import { type Book } from "@/types/book";

interface Props {
  book: Book;
}

const BookCard = ({ book }: Props) => {
  const handleDelete = () => {
    // TODO: confirm, then call your delete API for `book.id` and refresh the list
    notify.info("Delete isn't connected yet", { description: book.title });
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-accent-deep/40 bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:gap-6 sm:px-5">
      {/* Cover + title */}
      <div className="flex items-center gap-4 sm:w-72 sm:shrink-0">
        <Image
          src={book.coverUrl.length == 0? "/file.svg":book.coverUrl}
          alt={`Cover of ${book.title}`}
          width={56}
          height={76}
          className="h-[76px] w-14 shrink-0 rounded-md object-cover shadow-soft"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight text-primary">
            {book.title}
          </h2>
          {book.summary && (
            <p className="text-sm text-muted">{book.summary}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <dl className="grid flex-1 grid-cols-2 content-center gap-x-6 gap-y-3">
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Author
          </dt>
          <dd className="truncate text-sm text-primary">{book.authorName}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Category
          </dt>
          <dd className="truncate text-sm capitalize text-primary">
            {book.genre}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </dt>
          <dd>
            <span className="inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-primary">
              {book.availableQuantity>0? 'Available':'Not Available'}
            </span>
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={handleDelete}
        className="inline-flex items-center justify-center gap-1.5 self-end rounded-full border-2 border-accent-deep bg-accent px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent-deep sm:self-auto"
      >
        <LuTrash2 className="size-4" />
        Delete
      </button>
    </article>
  );
};

export default BookCard;

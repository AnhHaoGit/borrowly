"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Book } from "@/types/book";
import type { BorrowStatus } from "@/types/ticket";
import { BORROW_LIMIT } from "@/lib/receipts";
import BookCard from "./BookCard";
import BookReviews from "./BookReviews";
import BorrowButton from "./BorrowButton";
import { StarRating } from "@/components/ui/StarRating";
import { getLanguageName } from "@/lib/languages";
import type { ReviewState } from "@/types/review";
import {
  LuArrowLeft,
  LuBookOpen,
  LuBuilding2,
  LuCalendarDays,
  LuClock,
  LuGlobe,
  LuHash,
  LuMapPin,
  LuStar,
  LuTag,
  LuUsers,
} from "react-icons/lu";

interface Props {
  book: Book;
  similarBooks: Book[];
  reviewState: ReviewState;
  viewerId: string | null;
  // Trạng thái phiếu người xem đang giữ, theo bookId, để nút Borrow hiển thị đúng.
  borrowStates: Record<string, BorrowStatus>;
  activeBorrowCount: number;
}

const DESCRIPTION_PREVIEW_CHARS = 480;
const PUBLISHER_PREVIEW = 3;
const CHIP_PREVIEW = 8;

const formatDate = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const Badge = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-background px-3 py-1 text-xs uppercase tracking-wider text-secondary">
    {icon}
    {children}
  </span>
);

const Field = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
    <dt className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
      {icon}
      {label}
    </dt>
    <dd className="min-w-0 text-sm text-primary sm:text-right">{children}</dd>
  </div>
);

const ExpandableList = ({
  items,
  limit,
  variant = "chips",
}: {
  items: string[];
  limit: number;
  variant?: "chips" | "lines";
}) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, limit);
  const remaining = items.length - visible.length;

  return (
    <div
      className={
        variant === "chips"
          ? "flex flex-wrap items-center gap-1.5 sm:justify-end"
          : "space-y-0.5"
      }
    >
      {visible.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={
            variant === "chips"
              ? "max-w-full truncate rounded-full border border-accent bg-surface px-2.5 py-0.5 text-xs text-secondary"
              : "block text-sm leading-snug text-primary"
          }
        >
          {item}
        </span>
      ))}

      {items.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-full px-1 text-xs font-bold text-secondary underline-offset-2 hover:underline"
        >
          {expanded ? "Show less" : `+${remaining} more`}
        </button>
      )}
    </div>
  );
};

const BookDetail = ({
  book,
  similarBooks,
  reviewState,
  viewerId,
  borrowStates,
  activeBorrowCount,
}: Props) => {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const remaining = book.availableQuantity;
  const limitReached = activeBorrowCount >= BORROW_LIMIT;
  const isAuthenticated = Boolean(viewerId);
  const hasLongDescription =
    book.description.length > DESCRIPTION_PREVIEW_CHARS;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-4 py-2 text-sm text-secondary transition hover:border-secondary hover:text-primary"
      >
        <LuArrowLeft className="size-4" />
        Back to books
      </Link>

      <article className="mt-6 grid gap-8 rounded-2xl border border-accent bg-surface p-5 shadow-soft md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:p-8">
        {/* Cover + Borrow */}
        <div className="flex flex-col gap-5">
          <div className="relative mx-auto aspect-2/3 w-full max-w-75 overflow-hidden rounded-lg bg-accent/40 shadow-md ring-1 ring-primary/10">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 300px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-secondary">
                <LuBookOpen className="size-10" />
                <span className="line-clamp-5 text-base">{book.title}</span>
              </div>
            )}

            <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-full bg-background/90 px-2.5 py-0.5 text-xs text-secondary backdrop-blur">
              {book.genre}
            </span>
          </div>

          <div className="mx-auto w-full max-w-75 space-y-3">
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <span
                className={`size-2 shrink-0 rounded-full ${remaining > 0 ? "bg-emerald-500" : "bg-accent-deep"}`}
              />
              {remaining > 0
                ? `${remaining} ${remaining === 1 ? "copy" : "copies"} available`
                : "Currently out of stock"}
            </p>

            <BorrowButton
              bookId={book.id}
              bookTitle={book.title}
              status={borrowStates[book.id] ?? null}
              available={book.availableQuantity > 0}
              limitReached={limitReached}
              isAuthenticated={isAuthenticated}
              label="Borrow this book"
              size="md"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-col gap-6">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight text-primary md:text-4xl">
              {book.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent bg-accent/40 text-sm font-bold text-secondary">
                {book.authorImageUrl ? (
                  <Image
                    src={book.authorImageUrl}
                    alt={book.authorName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span>{book.authorName.charAt(0)}</span>
                )}
              </div>
              <p className="text-base text-secondary">
                by <span className="font-bold text-primary">{book.authorName}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge icon={<LuTag className="size-3.5" />}>{book.genre}</Badge>
              <Badge icon={<LuCalendarDays className="size-3.5" />}>
                {book.publishYear}
              </Badge>
              <Badge icon={<LuGlobe className="size-3.5" />}>
                {getLanguageName(book.language)}
              </Badge>
              <Badge icon={<StarRating value={book.rating ?? 0} size="sm" />}>
                {book.rating !== null
                  ? `${book.rating.toFixed(1)} / 5 · ${book.ratingCount} ${
                      book.ratingCount === 1 ? "rating" : "ratings"
                    }`
                  : "Not rated yet"}
              </Badge>
              <Badge icon={<LuUsers className="size-3.5" />}>
                {book.borrowCount} {book.borrowCount === 1 ? "borrow" : "borrows"}
              </Badge>
            </div>
          </header>

          {/* Description */}
          <section className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
              Description
            </h2>
            <p
              className={`whitespace-pre-line wrap-break-word text-sm leading-relaxed text-primary/85 ${
                hasLongDescription && !descriptionExpanded ? "line-clamp-6" : ""
              }`}
            >
              {book.description || "No description available for this book."}
            </p>
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                className="text-xs font-bold uppercase tracking-wider text-secondary underline-offset-2 hover:underline"
              >
                {descriptionExpanded ? "Show less" : "See more"}
              </button>
            )}
          </section>

          {/* Publication information */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
              Publication information
            </h2>

            <dl className="divide-y divide-accent/70 rounded-xl border border-accent/70 bg-background/60 px-5 py-1">
              {book.publishers.length > 0 && (
                <Field
                  icon={<LuBuilding2 className="size-3.5" />}
                  label="Publishers"
                >
                  <ExpandableList
                    items={book.publishers}
                    limit={PUBLISHER_PREVIEW}
                    variant="lines"
                  />
                </Field>
              )}

              <Field icon={<LuCalendarDays className="size-3.5" />} label="Year">
                {book.publishYear || "—"}
              </Field>

              <Field icon={<LuGlobe className="size-3.5" />} label="Language">
                {getLanguageName(book.language)}
              </Field>

              <Field icon={<LuTag className="size-3.5" />} label="Category">
                {book.genre || "—"}
              </Field>

              <Field icon={<LuHash className="size-3.5" />} label="Copies available">
                {book.availableQuantity}
              </Field>

              <Field icon={<LuUsers className="size-3.5" />} label="Times borrowed">
                {book.borrowCount}
              </Field>

              <Field
                icon={<LuStar className="size-3.5" />}
                label="Average rating"
              >
                {book.rating !== null ? (
                  <span className="inline-flex flex-wrap items-center gap-2 sm:justify-end">
                    <StarRating value={book.rating} size="sm" />
                    <span>
                      {book.rating.toFixed(2)} / 5 · {book.ratingCount}{" "}
                      {book.ratingCount === 1 ? "rating" : "ratings"}
                    </span>
                  </span>
                ) : (
                  "Not rated yet"
                )}
              </Field>

              <Field icon={<LuClock className="size-3.5" />} label="Added on">
                {formatDate(book.createdAt)}
              </Field>

              {book.subjects.length > 0 && (
                <Field icon={<LuBookOpen className="size-3.5" />} label="Subjects">
                  <ExpandableList items={book.subjects} limit={CHIP_PREVIEW} />
                </Field>
              )}

              {book.subjectPlaces.length > 0 && (
                <Field icon={<LuMapPin className="size-3.5" />} label="Settings">
                  <ExpandableList
                    items={book.subjectPlaces}
                    limit={CHIP_PREVIEW}
                  />
                </Field>
              )}

              {book.subjectTimes.length > 0 && (
                <Field icon={<LuClock className="size-3.5" />} label="Time periods">
                  <ExpandableList
                    items={book.subjectTimes}
                    limit={CHIP_PREVIEW}
                  />
                </Field>
              )}
            </dl>
          </section>
        </div>
      </article>

      <BookReviews
        bookId={book.id}
        initial={reviewState}
        viewerId={viewerId}
      />

      {/* Similar books */}
      {similarBooks.length > 0 && (
        <section className="mt-12 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-primary">
                More in {book.genre}
              </h2>
              <p className="mt-1 text-sm text-muted">
                More {book.genre.toLowerCase()} titles from the library.
              </p>
            </div>
            <Link
              href="/books"
              className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
            >
              Browse all books
            </Link>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarBooks.map((item) => (
              <li key={item.id}>
                <BookCard
                  book={item}
                  borrowStatus={borrowStates[item.id] ?? null}
                  borrowLimitReached={limitReached}
                  isAuthenticated={isAuthenticated}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default BookDetail;

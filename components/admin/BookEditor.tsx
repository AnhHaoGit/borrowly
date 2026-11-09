"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LuArrowLeft,
  LuBookOpen,
  LuBuilding2,
  LuCalendarDays,
  LuClock,
  LuGlobe,
  LuHash,
  LuLoaderCircle,
  LuSave,
  LuStar,
  LuTag,
  LuTrash2,
  LuUsers,
} from "react-icons/lu";
import { createBook, deleteBook, updateBook } from "@/app/actions/admin-books";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TagInput from "@/components/admin/TagInput";
import {
  BOOK_LANGUAGES,
  BOOK_LIMITS,
  validateBookInput,
  type BookFieldErrors,
  type BookInput,
} from "@/lib/book-input";
import { formatDate } from "@/lib/date";
import { getLanguageName } from "@/lib/languages";
import { notify } from "@/lib/toast";
import type { Book } from "@/types/book";

interface FormValues {
  title: string;
  authorName: string;
  authorImageUrl: string;
  genre: string;
  publishYear: string;
  language: string;
  availableQuantity: string;
  coverUrl: string;
  summary: string;
  description: string;
  subjects: string[];
  subjectPlaces: string[];
  subjectTimes: string[];
  publishers: string[];
}

const EMPTY: FormValues = {
  title: "",
  authorName: "",
  authorImageUrl: "",
  genre: "",
  publishYear: "",
  language: "eng",
  availableQuantity: "1",
  coverUrl: "",
  summary: "",
  description: "",
  subjects: [],
  subjectPlaces: [],
  subjectTimes: [],
  publishers: [],
};

const fromBook = (book?: Book): FormValues =>
  book
    ? {
        title: book.title,
        authorName: book.authorName,
        authorImageUrl: book.authorImageUrl ?? "",
        genre: book.genre,
        publishYear: String(book.publishYear),
        language: book.language,
        availableQuantity: String(book.availableQuantity),
        coverUrl: book.coverUrl,
        summary: book.summary,
        description: book.description,
        subjects: book.subjects,
        subjectPlaces: book.subjectPlaces,
        subjectTimes: book.subjectTimes,
        publishers: book.publishers,
      }
    : EMPTY;

const toInput = (values: FormValues): BookInput => ({
  title: values.title,
  authorName: values.authorName,
  authorImageUrl: values.authorImageUrl.trim() || null,
  genre: values.genre,
  publishYear: Number(values.publishYear),
  coverUrl: values.coverUrl,
  summary: values.summary,
  description: values.description,
  availableQuantity: Number(values.availableQuantity),
  language: values.language,
  subjects: values.subjects,
  subjectPlaces: values.subjectPlaces,
  subjectTimes: values.subjectTimes,
  publishers: values.publishers,
});

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const INPUT =
  "h-11 w-full rounded-xl border-2 bg-background px-4 text-base text-primary placeholder:text-muted/60 transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-primary/20";
const TEXTAREA =
  "w-full rounded-xl border-2 bg-background px-4 py-3 text-base leading-relaxed text-primary placeholder:text-muted/60 transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-primary/20";
const borderFor = (error?: string) =>
  error ? "border-danger" : "border-accent-deep/40";

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={`${id}-error`} className="mt-1 text-sm text-danger">
      {message}
    </p>
  ) : null;

const Label = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-primary">
    {children}
  </label>
);

const Row = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between md:gap-8">
    <span className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary md:pt-3">
      {icon}
      {label}
    </span>
    <div className="w-full min-w-0 md:max-w-[62%]">{children}</div>
  </div>
);

interface Props {
  mode: "create" | "edit";
  book?: Book;
  genres: string[];
}

const BookEditor = ({ mode, book, genres }: Props) => {
  const router = useRouter();
  const initial = fromBook(book);

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<BookFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [brokenCover, setBrokenCover] = useState<string | null>(null);

  const dirty =
    mode === "create" ||
    JSON.stringify(toInput(values)) !== JSON.stringify(toInput(initial));

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const input = toInput(values);
    const found = validateBookInput(input);

    setErrors(found);

    const firstInvalid = Object.keys(found)[0];

    if (firstInvalid) {
      document.getElementById(`book-${firstInvalid}`)?.focus();
      notify.error("Please fix the highlighted fields and try again.");
      return;
    }

    setPending(true);

    const result =
      mode === "create"
        ? await createBook(input)
        : await updateBook(book!.id, input);

    setPending(false);

    if (!result.success) {
      if (result.errors) setErrors(result.errors);
      notify.error(result.message);
      return;
    }

    notify.success(mode === "create" ? "Book added" : "Changes saved", {
      description: input.title.trim(),
    });

    if (mode === "create") {
      router.push(`/admin/books/${result.bookId}`);
    } else {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!book) return;

    setDeleting(true);

    const result = await deleteBook(book.id);

    setDeleting(false);

    if (!result.success) {
      notify.error(result.message);
      setConfirmOpen(false);
      return;
    }

    notify.success("Book deleted", { description: book.title });
    setConfirmOpen(false);
    router.push("/admin/books");
  };

  const discard = () => {
    setValues(initial);
    setErrors({});
    notify.info("Changes discarded");
  };

  const cover = values.coverUrl.trim();
  const showCover = isHttpUrl(cover) && brokenCover !== cover;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-4 py-2 text-sm text-secondary transition hover:border-secondary hover:text-primary"
        >
          <LuArrowLeft className="size-4" />
          Back to books
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-danger/40 px-5 text-sm text-danger transition hover:bg-danger/10"
            >
              <LuTrash2 className="size-4" />
              Delete book
            </button>
          )}

          <button
            type="submit"
            form="book-form"
            disabled={pending || !dirty}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary bg-primary px-6 text-sm text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <LuLoaderCircle className="size-4 animate-spin" />
            ) : (
              <LuSave className="size-4" />
            )}
            {mode === "create" ? "Create book" : "Save changes"}
          </button>
        </div>
      </div>

      <header className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {mode === "create" ? "New book" : "Editing"}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight text-primary md:text-4xl">
          {mode === "create" ? "Add a new book" : book?.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {mode === "create"
            ? "Fill in the details below, then create the book to add it to the catalogue."
            : "Every field is editable in place. Save when you're done."}
        </p>
      </header>

      <form id="book-form" onSubmit={handleSubmit} noValidate className="mt-6">
        <div className="grid gap-8 rounded-2xl border border-accent bg-surface p-5 shadow-soft md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:p-8">
          {/* Cover */}
          <div className="flex flex-col gap-4">
            <div className="relative mx-auto aspect-2/3 w-full max-w-75 overflow-hidden rounded-lg border-2 border-dashed border-accent-deep/50 bg-accent/30 shadow-md">
              {showCover ? (
                <Image
                  src={cover}
                  alt="Cover preview"
                  fill
                  sizes="(max-width: 768px) 80vw, 300px"
                  onError={() => setBrokenCover(cover)}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center text-secondary">
                  <LuBookOpen className="size-10" />
                  <span className="text-sm">Cover preview</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="book-coverUrl">Cover URL</Label>
              <input
                id="book-coverUrl"
                type="url"
                value={values.coverUrl}
                onChange={(event) => set("coverUrl", event.target.value)}
                placeholder="https://…"
                aria-invalid={Boolean(errors.coverUrl)}
                aria-describedby={
                  errors.coverUrl ? "book-coverUrl-error" : undefined
                }
                className={`${INPUT} ${borderFor(errors.coverUrl)}`}
              />
              <FieldError id="book-coverUrl" message={errors.coverUrl} />
            </div>
          </div>

          {/* Details */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="book-title">Title</Label>
                <input
                  id="book-title"
                  value={values.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder="Book title"
                  maxLength={BOOK_LIMITS.title}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "book-title-error" : undefined}
                  className={`${INPUT} h-14 text-2xl font-bold ${borderFor(errors.title)}`}
                />
                <FieldError id="book-title" message={errors.title} />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent bg-accent/40 text-sm font-bold text-secondary">
                  {isHttpUrl(values.authorImageUrl.trim()) ? (
                    <Image
                      src={values.authorImageUrl.trim()}
                      alt={values.authorName || "Author"}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <span>
                      {(values.authorName.trim() || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Label htmlFor="book-authorName">Author</Label>
                  <input
                    id="book-authorName"
                    value={values.authorName}
                    onChange={(event) => set("authorName", event.target.value)}
                    placeholder="Author name"
                    maxLength={BOOK_LIMITS.authorName}
                    aria-invalid={Boolean(errors.authorName)}
                    aria-describedby={
                      errors.authorName ? "book-authorName-error" : undefined
                    }
                    className={`${INPUT} ${borderFor(errors.authorName)}`}
                  />
                  <FieldError id="book-authorName" message={errors.authorName} />
                </div>
              </div>

              <div>
                <Label htmlFor="book-authorImageUrl">Author photo URL (optional)</Label>
                <input
                  id="book-authorImageUrl"
                  type="url"
                  value={values.authorImageUrl}
                  onChange={(event) => set("authorImageUrl", event.target.value)}
                  placeholder="https://…"
                  aria-invalid={Boolean(errors.authorImageUrl)}
                  aria-describedby={
                    errors.authorImageUrl ? "book-authorImageUrl-error" : undefined
                  }
                  className={`${INPUT} ${borderFor(errors.authorImageUrl)}`}
                />
                <FieldError
                  id="book-authorImageUrl"
                  message={errors.authorImageUrl}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="book-genre">Genre</Label>
                  <select
                    id="book-genre"
                    value={values.genre}
                    onChange={(event) => set("genre", event.target.value)}
                    aria-invalid={Boolean(errors.genre)}
                    className={`${INPUT} ${borderFor(errors.genre)}`}
                  >
                    <option value="">Select…</option>
                    {[...new Set([values.genre, ...genres])]
                      .filter(Boolean)
                      .map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                  </select>
                  <FieldError id="book-genre" message={errors.genre} />
                </div>

                <div>
                  <Label htmlFor="book-publishYear">Publish year</Label>
                  <input
                    id="book-publishYear"
                    type="number"
                    inputMode="numeric"
                    value={values.publishYear}
                    onChange={(event) => set("publishYear", event.target.value)}
                    placeholder="e.g. 1999"
                    aria-invalid={Boolean(errors.publishYear)}
                    className={`${INPUT} ${borderFor(errors.publishYear)}`}
                  />
                  <FieldError id="book-publishYear" message={errors.publishYear} />
                </div>

                <div>
                  <Label htmlFor="book-language">Language</Label>
                  <select
                    id="book-language"
                    value={values.language}
                    onChange={(event) => set("language", event.target.value)}
                    aria-invalid={Boolean(errors.language)}
                    className={`${INPUT} ${borderFor(errors.language)}`}
                  >
                    {[
                      ...BOOK_LANGUAGES,
                      ...(BOOK_LANGUAGES.some(
                        (item) => item.code === values.language,
                      )
                        ? []
                        : [
                            {
                              code: values.language,
                              label: getLanguageName(values.language),
                            },
                          ]),
                    ]
                      .filter((item) => item.code)
                      .map(({ code, label }) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                  </select>
                  <FieldError id="book-language" message={errors.language} />
                </div>
              </div>

              {mode === "edit" && book && (
                <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <LuStar className="size-3.5" />
                    {book.rating !== null
                      ? `${book.rating.toFixed(1)} / 5 · ${book.ratingCount} ratings`
                      : "Not rated yet"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <LuUsers className="size-3.5" />
                    {book.borrowCount} borrows
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <LuClock className="size-3.5" />
                    Added {formatDate(book.createdAt)}
                  </span>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="book-summary">Summary</Label>
              <textarea
                id="book-summary"
                rows={3}
                value={values.summary}
                onChange={(event) => set("summary", event.target.value)}
                maxLength={BOOK_LIMITS.summary}
                placeholder="One or two sentences shown on the book card."
                aria-invalid={Boolean(errors.summary)}
                aria-describedby={errors.summary ? "book-summary-error" : undefined}
                className={`${TEXTAREA} ${borderFor(errors.summary)}`}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                <FieldError id="book-summary" message={errors.summary} />
                <span className="ml-auto shrink-0 text-xs text-muted">
                  {values.summary.length}/{BOOK_LIMITS.summary}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="book-description">Description</Label>
              <textarea
                id="book-description"
                rows={8}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="Full description shown on the book detail page."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "book-description-error" : undefined
                }
                className={`${TEXTAREA} ${borderFor(errors.description)}`}
              />
              <FieldError id="book-description" message={errors.description} />
            </div>

            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
                Publication information
              </h2>

              <div className="divide-y divide-accent/70 rounded-xl border border-accent/70 bg-background/60 px-5 py-1">
                <Row icon={<LuBuilding2 className="size-3.5" />} label="Publishers">
                  <TagInput
                    id="book-publishers"
                    values={values.publishers}
                    onChange={(next) => set("publishers", next)}
                    max={BOOK_LIMITS.publishers}
                    placeholder="e.g. Penguin Books"
                  />
                  <FieldError id="book-publishers" message={errors.publishers} />
                </Row>

                <Row icon={<LuHash className="size-3.5" />} label="Copies available">
                  <input
                    id="book-availableQuantity"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={values.availableQuantity}
                    onChange={(event) =>
                      set("availableQuantity", event.target.value)
                    }
                    aria-invalid={Boolean(errors.availableQuantity)}
                    className={`${INPUT} ${borderFor(errors.availableQuantity)}`}
                  />
                  <FieldError
                    id="book-availableQuantity"
                    message={errors.availableQuantity}
                  />
                </Row>

                <Row icon={<LuTag className="size-3.5" />} label="Category">
                  <p className="text-sm text-primary md:text-right">
                    {values.genre || "—"}
                  </p>
                </Row>

                <Row icon={<LuGlobe className="size-3.5" />} label="Language">
                  <p className="text-sm text-primary md:text-right">
                    {getLanguageName(values.language)}
                  </p>
                </Row>

                <Row icon={<LuCalendarDays className="size-3.5" />} label="Year">
                  <p className="text-sm text-primary md:text-right">
                    {values.publishYear || "—"}
                  </p>
                </Row>

                <Row icon={<LuBookOpen className="size-3.5" />} label="Subjects">
                  <TagInput
                    id="book-subjects"
                    values={values.subjects}
                    onChange={(next) => set("subjects", next)}
                    max={BOOK_LIMITS.subjects}
                    placeholder="e.g. Magic, Dragons"
                  />
                  <FieldError id="book-subjects" message={errors.subjects} />
                </Row>

                <Row icon={<LuTag className="size-3.5" />} label="Settings">
                  <TagInput
                    id="book-subjectPlaces"
                    values={values.subjectPlaces}
                    onChange={(next) => set("subjectPlaces", next)}
                    max={BOOK_LIMITS.subjectPlaces}
                    placeholder="e.g. London"
                  />
                  <FieldError
                    id="book-subjectPlaces"
                    message={errors.subjectPlaces}
                  />
                </Row>

                <Row icon={<LuClock className="size-3.5" />} label="Time periods">
                  <TagInput
                    id="book-subjectTimes"
                    values={values.subjectTimes}
                    onChange={(next) => set("subjectTimes", next)}
                    max={BOOK_LIMITS.subjectTimes}
                    placeholder="e.g. 19th century"
                  />
                  <FieldError
                    id="book-subjectTimes"
                    message={errors.subjectTimes}
                  />
                </Row>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {dirty && (
            <span className="mr-auto text-sm text-muted">
              You have unsaved changes.
            </span>
          )}

          <button
            type="button"
            onClick={mode === "create" ? () => router.push("/admin/books") : discard}
            disabled={pending || !dirty}
            className="inline-flex h-11 items-center rounded-full border-2 border-accent-deep bg-accent px-5 text-sm text-primary transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "create" ? "Cancel" : "Discard"}
          </button>

          <button
            type="submit"
            disabled={pending || !dirty}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary bg-primary px-6 text-sm text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <LuLoaderCircle className="size-4 animate-spin" />
            ) : (
              <LuSave className="size-4" />
            )}
            {pending ? "Saving…" : mode === "create" ? "Create book" : "Save changes"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this book?"
        description={
          book
            ? `"${book.title}" will be removed from the catalogue. This can't be undone.`
            : ""
        }
        confirmLabel="Delete book"
        pending={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmOpen(false)}
      />

    </div>
  );
};

export default BookEditor;

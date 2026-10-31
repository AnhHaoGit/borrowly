"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LuBookOpen, LuLoader, LuSave } from "react-icons/lu";
import TagInput from "./TagInput";
import { notify } from "@/lib/toast";
import type { Book } from "@/types/book";

// What the form submits: a Book minus everything the server fills in
export type NewBookInput = Omit<
  Book,
  "id" | "rating" | "borrowCount" | "createdAt"
>;

// Same limits as the seed script
const LIMITS = { subjects: 20, subjectPlaces: 10, subjectTimes: 10, publishers: 10 };

// TODO: adjust to the languages your library supports
const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "vie", label: "Vietnamese" },
  { code: "fre", label: "French" },
  { code: "ger", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "jpn", label: "Japanese" },
  { code: "chi", label: "Chinese" },
];

interface FormValues {
  title: string;
  authorName: string;
  authorImageUrl: string;
  genre: string;
  publishYear: string; // strings so the inputs can be empty
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

type Errors = Partial<Record<keyof FormValues, string>>;

const INITIAL: FormValues = {
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

const isUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validate = (v: FormValues): Errors => {
  const errors: Errors = {};
  const year = Number(v.publishYear);
  const quantity = Number(v.availableQuantity);

  if (!v.title.trim()) errors.title = "Title is required.";
  else if (v.title.trim().length > 255) errors.title = "Max 255 characters.";

  if (!v.authorName.trim()) errors.authorName = "Author is required.";
  else if (v.authorName.trim().length > 255)
    errors.authorName = "Max 255 characters.";

  if (v.authorImageUrl.trim() && !isUrl(v.authorImageUrl.trim()))
    errors.authorImageUrl = "Enter a valid http(s) URL.";

  if (!v.genre) errors.genre = "Choose a genre.";

  if (v.publishYear === "") errors.publishYear = "Publish year is required.";
  else if (
    !Number.isInteger(year) ||
    year < 0 ||
    year > new Date().getFullYear()
  )
    errors.publishYear = "Enter a valid year.";

  if (!v.language) errors.language = "Choose a language.";

  if (v.availableQuantity === "") errors.availableQuantity = "Required.";
  else if (!Number.isInteger(quantity) || quantity < 0)
    errors.availableQuantity = "Enter a whole number, 0 or more.";

  if (!v.coverUrl.trim()) errors.coverUrl = "Cover URL is required.";
  else if (!isUrl(v.coverUrl.trim()))
    errors.coverUrl = "Enter a valid http(s) URL.";

  if (!v.summary.trim()) errors.summary = "Summary is required.";
  else if (v.summary.trim().length > 200)
    errors.summary = "Keep the summary under 200 characters.";

  if (!v.description.trim()) errors.description = "Description is required.";

  return errors;
};

const INPUT =
  "h-11 w-full rounded-xl border-2 bg-background px-4 text-base text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";
const TEXTAREA =
  "w-full rounded-xl border-2 bg-background px-4 py-3 text-base text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";
const CARD =
  "rounded-2xl border border-accent-deep/40 bg-surface p-5 shadow-soft";

const borderFor = (error?: string) =>
  error ? "border-red-500" : "border-accent-deep/60";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

const Field = ({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FieldProps) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-primary">
      {label}
      {required && <span className="text-red-600"> *</span>}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    ) : hint ? (
      <p className="mt-1 text-xs text-muted">{hint}</p>
    ) : null}
  </div>
);

interface Props {
  genres: string[];
}

const AddBookForm = ({ genres }: Props) => {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [brokenCover, setBrokenCover] = useState<string | null>(null);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined })); // clear this field's error while typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`book-${firstInvalid}`)?.focus();
      return;
    }

    const payload: NewBookInput = {
      title: values.title.trim(),
      authorName: values.authorName.trim(),
      authorImageUrl: values.authorImageUrl.trim() || null,
      genre: values.genre,
      publishYear: Number(values.publishYear),
      coverUrl: values.coverUrl.trim(),
      summary: values.summary.trim(),
      description: values.description.trim(),
      availableQuantity: Number(values.availableQuantity),
      language: values.language,
      subjects: values.subjects,
      subjectPlaces: values.subjectPlaces,
      subjectTimes: values.subjectTimes,
      publishers: values.publishers,
    };

    setPending(true);
    try {
      // TODO: save `payload` (call your API route or server action, e.g. POST /api/admin/books)
      // TODO: on success, show a success toast and router.push("/admin/books")
      notify.info("Saving isn't connected yet", { description: payload.title });
    } finally {
      setPending(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const coverPreviewable =
    isUrl(values.coverUrl.trim()) && brokenCover !== values.coverUrl.trim();

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {errorCount > 0 && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Please fix the {errorCount} highlighted{" "}
          {errorCount === 1 ? "field" : "fields"} and try again.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Cover */}
        <section className={`${CARD} h-fit space-y-4`}>
          <div className="mx-auto aspect-[2/3] w-full max-w-[16rem] overflow-hidden rounded-xl border-2 border-dashed border-accent-deep/60 bg-background">
            {coverPreviewable ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote preview of an arbitrary URL
              <img
                src={values.coverUrl.trim()}
                alt="Cover preview"
                onError={() => setBrokenCover(values.coverUrl.trim())}
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted">
                <LuBookOpen className="size-10" />
              </div>
            )}
          </div>
          <Field
            id="book-coverUrl"
            label="Cover URL"
            required
            error={errors.coverUrl}
          >
            <input
              id="book-coverUrl"
              type="url"
              value={values.coverUrl}
              onChange={(e) => set("coverUrl", e.target.value)}
              placeholder="https://…"
              aria-invalid={Boolean(errors.coverUrl)}
              aria-describedby={errors.coverUrl ? "book-coverUrl-error" : undefined}
              className={`${INPUT} ${borderFor(errors.coverUrl)}`}
            />
          </Field>
        </section>

        <div className="min-w-0 space-y-6">
          {/* Basic info */}
          <section className={`${CARD} grid gap-4 sm:grid-cols-2`}>
            <Field
              id="book-title"
              label="Title"
              required
              error={errors.title}
              className="sm:col-span-2"
            >
              <input
                id="book-title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "book-title-error" : undefined}
                className={`${INPUT} ${borderFor(errors.title)}`}
              />
            </Field>

            <Field
              id="book-authorName"
              label="Author"
              required
              error={errors.authorName}
            >
              <input
                id="book-authorName"
                value={values.authorName}
                onChange={(e) => set("authorName", e.target.value)}
                aria-invalid={Boolean(errors.authorName)}
                aria-describedby={
                  errors.authorName ? "book-authorName-error" : undefined
                }
                className={`${INPUT} ${borderFor(errors.authorName)}`}
              />
            </Field>

            <Field
              id="book-authorImageUrl"
              label="Author photo URL"
              error={errors.authorImageUrl}
              hint="Optional."
            >
              <input
                id="book-authorImageUrl"
                type="url"
                value={values.authorImageUrl}
                onChange={(e) => set("authorImageUrl", e.target.value)}
                placeholder="https://…"
                aria-invalid={Boolean(errors.authorImageUrl)}
                aria-describedby={
                  errors.authorImageUrl ? "book-authorImageUrl-error" : undefined
                }
                className={`${INPUT} ${borderFor(errors.authorImageUrl)}`}
              />
            </Field>

            <Field id="book-genre" label="Genre" required error={errors.genre}>
              <select
                id="book-genre"
                value={values.genre}
                onChange={(e) => set("genre", e.target.value)}
                aria-invalid={Boolean(errors.genre)}
                aria-describedby={errors.genre ? "book-genre-error" : undefined}
                className={`${INPUT} ${borderFor(errors.genre)}`}
              >
                <option value="">Select a genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="book-language"
              label="Language"
              required
              error={errors.language}
            >
              <select
                id="book-language"
                value={values.language}
                onChange={(e) => set("language", e.target.value)}
                aria-invalid={Boolean(errors.language)}
                aria-describedby={
                  errors.language ? "book-language-error" : undefined
                }
                className={`${INPUT} ${borderFor(errors.language)}`}
              >
                {LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="book-publishYear"
              label="Publish year"
              required
              error={errors.publishYear}
            >
              <input
                id="book-publishYear"
                type="number"
                inputMode="numeric"
                value={values.publishYear}
                onChange={(e) => set("publishYear", e.target.value)}
                placeholder="e.g. 1999"
                aria-invalid={Boolean(errors.publishYear)}
                aria-describedby={
                  errors.publishYear ? "book-publishYear-error" : undefined
                }
                className={`${INPUT} ${borderFor(errors.publishYear)}`}
              />
            </Field>

            <Field
              id="book-availableQuantity"
              label="Copies available"
              required
              error={errors.availableQuantity}
            >
              <input
                id="book-availableQuantity"
                type="number"
                inputMode="numeric"
                min={0}
                value={values.availableQuantity}
                onChange={(e) => set("availableQuantity", e.target.value)}
                aria-invalid={Boolean(errors.availableQuantity)}
                aria-describedby={
                  errors.availableQuantity
                    ? "book-availableQuantity-error"
                    : undefined
                }
                className={`${INPUT} ${borderFor(errors.availableQuantity)}`}
              />
            </Field>
          </section>

          {/* Summary + description */}
          <section className={`${CARD} space-y-4`}>
            <Field
              id="book-summary"
              label="Summary"
              required
              error={errors.summary}
              hint={`${values.summary.length}/200 characters`}
            >
              <textarea
                id="book-summary"
                rows={3}
                value={values.summary}
                onChange={(e) => set("summary", e.target.value)}
                aria-invalid={Boolean(errors.summary)}
                aria-describedby={errors.summary ? "book-summary-error" : undefined}
                className={`${TEXTAREA} ${borderFor(errors.summary)}`}
              />
            </Field>

            <Field
              id="book-description"
              label="Description"
              required
              error={errors.description}
            >
              <textarea
                id="book-description"
                rows={8}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "book-description-error" : undefined
                }
                className={`${TEXTAREA} ${borderFor(errors.description)}`}
              />
            </Field>
          </section>

          {/* Tags */}
          <section className={`${CARD} space-y-4`}>
            <Field id="book-subjects" label="Subjects">
              <TagInput
                id="book-subjects"
                values={values.subjects}
                onChange={(next) => set("subjects", next)}
                max={LIMITS.subjects}
                placeholder="e.g. Magic, Dragons"
              />
            </Field>
            <Field id="book-subjectPlaces" label="Places">
              <TagInput
                id="book-subjectPlaces"
                values={values.subjectPlaces}
                onChange={(next) => set("subjectPlaces", next)}
                max={LIMITS.subjectPlaces}
                placeholder="e.g. London"
              />
            </Field>
            <Field id="book-subjectTimes" label="Time periods">
              <TagInput
                id="book-subjectTimes"
                values={values.subjectTimes}
                onChange={(next) => set("subjectTimes", next)}
                max={LIMITS.subjectTimes}
                placeholder="e.g. 19th century"
              />
            </Field>
            <Field id="book-publishers" label="Publishers">
              <TagInput
                id="book-publishers"
                values={values.publishers}
                onChange={(next) => set("publishers", next)}
                max={LIMITS.publishers}
                placeholder="e.g. Penguin Books"
              />
            </Field>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/admin/books"
          className="inline-flex h-12 items-center rounded-full border-2 border-accent-deep bg-accent px-6 text-base text-primary transition hover:bg-accent-deep"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <LuLoader className="size-5 animate-spin" />
          ) : (
            <LuSave className="size-5" />
          )}
          {pending ? "Saving…" : "Save book"}
        </button>
      </div>
    </form>
  );
};

export default AddBookForm;
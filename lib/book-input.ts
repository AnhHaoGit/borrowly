import { GENRES } from "@/database/books";

// Ngôn ngữ cho ô chọn trong form admin (giữ mã 3 ký tự như dữ liệu sách nhập từ
// Open Library để không phải map lại khi lưu).
export const BOOK_LANGUAGES: { code: string; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "vie", label: "Vietnamese" },
  { code: "fre", label: "French" },
  { code: "ger", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "jpn", label: "Japanese" },
  { code: "chi", label: "Chinese" },
];

export const BOOK_LIMITS = {
  title: 255,
  authorName: 255,
  summary: 200,
  description: 20_000,
  tag: 100,
  subjects: 20,
  subjectPlaces: 10,
  subjectTimes: 10,
  publishers: 10,
} as const;

// Những gì form admin gửi lên (đã ép kiểu số), không gồm các cột do server tự
// tính như rating, ratingCount, borrowCount hay createdAt.
export interface BookInput {
  title: string;
  authorName: string;
  authorImageUrl: string | null;
  genre: string;
  publishYear: number;
  coverUrl: string;
  summary: string;
  description: string;
  availableQuantity: number;
  language: string;
  subjects: string[];
  subjectPlaces: string[];
  subjectTimes: string[];
  publishers: string[];
}

export type BookFieldErrors = Partial<Record<keyof BookInput, string>>;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validateTags = (
  tags: string[],
  max: number,
  label: string,
): string | undefined => {
  if (tags.length > max) return `At most ${max} ${label}.`;

  if (
    tags.some(
      (tag) => tag.trim().length === 0 || tag.length > BOOK_LIMITS.tag,
    )
  ) {
    return `Each entry must be 1–${BOOK_LIMITS.tag} characters.`;
  }

  const unique = new Set(tags.map((tag) => tag.trim().toLowerCase()));

  if (unique.size !== tags.length) return "Duplicate entries aren't allowed.";

  return undefined;
};

/**
 * Validate dữ liệu sách ở cả client (hiện lỗi ngay tại ô) và server (chốt chặn
 * cuối, không tin dữ liệu từ trình duyệt).
 */
export function validateBookInput(
  input: BookInput,
  currentYear = new Date().getFullYear(),
): BookFieldErrors {
  const errors: BookFieldErrors = {};

  const title = input.title.trim();
  if (!title) errors.title = "Title is required.";
  else if (title.length > BOOK_LIMITS.title)
    errors.title = `Max ${BOOK_LIMITS.title} characters.`;

  const author = input.authorName.trim();
  if (!author) errors.authorName = "Author is required.";
  else if (author.length > BOOK_LIMITS.authorName)
    errors.authorName = `Max ${BOOK_LIMITS.authorName} characters.`;

  if (!GENRES.includes(input.genre)) errors.genre = "Choose a genre.";

  if (!Number.isInteger(input.publishYear))
    errors.publishYear = "Enter a whole year.";
  else if (input.publishYear < 0 || input.publishYear > currentYear)
    errors.publishYear = `Enter a year between 0 and ${currentYear}.`;

  if (!input.language.trim()) errors.language = "Choose a language.";

  if (!input.coverUrl.trim()) errors.coverUrl = "Cover URL is required.";
  else if (!isHttpUrl(input.coverUrl.trim()))
    errors.coverUrl = "Enter a valid http(s) URL.";

  if (input.authorImageUrl && !isHttpUrl(input.authorImageUrl))
    errors.authorImageUrl = "Enter a valid http(s) URL.";

  const summary = input.summary.trim();
  if (!summary) errors.summary = "Summary is required.";
  else if (summary.length > BOOK_LIMITS.summary)
    errors.summary = `Keep the summary under ${BOOK_LIMITS.summary} characters.`;

  if (!input.description.trim())
    errors.description = "Description is required.";
  else if (input.description.length > BOOK_LIMITS.description)
    errors.description = `Max ${BOOK_LIMITS.description} characters.`;

  if (!Number.isInteger(input.availableQuantity))
    errors.availableQuantity = "Enter a whole number.";
  else if (input.availableQuantity < 0)
    errors.availableQuantity = "Copies can't be negative.";

  errors.subjects = validateTags(
    input.subjects,
    BOOK_LIMITS.subjects,
    "subjects",
  );
  errors.subjectPlaces = validateTags(
    input.subjectPlaces,
    BOOK_LIMITS.subjectPlaces,
    "places",
  );
  errors.subjectTimes = validateTags(
    input.subjectTimes,
    BOOK_LIMITS.subjectTimes,
    "time periods",
  );
  errors.publishers = validateTags(
    input.publishers,
    BOOK_LIMITS.publishers,
    "publishers",
  );

  // Bỏ các trường không có lỗi để `Object.keys(errors)` phản ánh đúng số lỗi.
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as BookFieldErrors;
}

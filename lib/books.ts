import type { Book, SortKey } from "@/types/book";

export const PAGE_SIZE = 8;

export const coverUrl = (coverId: number) =>
  `https://picsum.photos/seed/borrowly-${coverId}/400/600`;

export const SORTERS: Record<SortKey, (a: Book, b: Book) => number> = {
  default: (a, b) => a.id - b.id,
  title: (a, b) => a.title.localeCompare(b.title),
  "year-desc": (a, b) => (b.publish_year ?? 0) - (a.publish_year ?? 0),
  "year-asc": (a, b) => (a.publish_year ?? 9999) - (b.publish_year ?? 9999),
};

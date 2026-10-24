export interface Book {
  id: string;
  title: string;
  authorName: string;
  authorImageUrl: string | null;
  genre: string;
  publishYear: number;
  coverUrl: string;
  summary: string;
  description: string;
  availableQuantity: number;
  rating: number | null;
  borrowCount: number;
  language: string;
  subjects: string[];
  subjectPlaces: string[];
  subjectTimes: string[];
  publishers: string[];
  createdAt: Date;
}

export type Status = "all" | "available" | "unavailable";
export type SortKey =
  | "default"
  | "title-asc"
  | "title-desc"
  | "year-desc"
  | "year-asc";
export interface Filters {
  query: string;
  genres: string[];
  yearMin: string; // để string để ô input có thể rỗng
  yearMax: string;
  status: Status;
  sort: SortKey;
}
export interface Book {
  id: number;
  title: string;
  author_name: string;
  genre: string;
  publish_year: number | null;
  cover_id: number | null;
  summary: string;
  description: string;
  available_quantity: number;
}

export type Status = "all" | "available" | "unavailable";
export type SortKey = "default" | "title" | "year-desc" | "year-asc";

export interface Filters {
  query: string;
  genres: string[];
  yearMin: string; // để string để ô input có thể rỗng
  yearMax: string;
  status: Status;
  sort: SortKey;
}

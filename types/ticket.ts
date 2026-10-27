import type { Book } from "./book";
import type { Reader } from "./reader";

export type BorrowStatus =
  | "PENDING"
  | "BORROWED"
  | "RETURNED"
  | "OVERDUE"
  | "EXPIRED";

// Mirrors the `receipts` table
export interface Ticket {
  id: string;
  userId: string;
  bookId: string;
  status: BorrowStatus;
  borrowDate: Date | null; // null until the book is actually picked up
  dueDate: string | null; // "YYYY-MM-DD"
  returnDate: string | null; // "YYYY-MM-DD"
  createdAt: Date;
}

// A ticket joined with its reader and book
export interface TicketWithDetails extends Ticket {
  reader: Pick<Reader, "id" | "fullName" | "email">;
  book: Pick<Book, "id" | "title" | "coverUrl">;
}

// Derived from `dueDate` (not stored in the DB); drives the colored pill in the table
export type TicketTimeStatus =
  | { kind: "due-today" }
  | { kind: "overdue" }
  | { kind: "days-left"; days: number };

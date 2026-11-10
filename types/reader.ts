export type Role = "USER" | "ADMIN";

// Mirrors the `users` table, minus `password` (never send the hash to the client)
export interface Reader {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  lastActivityDate: string | null; // drizzle `date` columns come back as "YYYY-MM-DD" strings
  createdAt: Date;
}

// Người dùng kèm số phiếu, để trang admin thấy ngay ai đang giữ sách.
export interface ReaderWithStats extends Reader {
  activeReceipts: number; // PENDING + BORROWED + OVERDUE
  totalReceipts: number;
}

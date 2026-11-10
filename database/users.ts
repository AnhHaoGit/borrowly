import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { receipts, users } from "@/database/schema";
import type { ReaderWithStats } from "@/types/reader";

/**
 * Thông tin hiển thị của một người dùng, không bao gồm `password`.
 * Trả về `null` khi id không tồn tại (ví dụ token cũ của user đã bị xoá).
 */
export const getUserProfile = async (userId: string) => {
  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

/**
 * Toàn bộ người dùng kèm số phiếu: một truy vấn LEFT JOIN + GROUP BY nên người
 * chưa mượn cuốn nào vẫn xuất hiện với số 0 (không phải N+1).
 */
export const getReadersWithStats = async (): Promise<ReaderWithStats[]> => {
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      lastActivityDate: users.lastActivityDate,
      createdAt: users.createdAt,
      activeReceipts: sql<number>`count(${receipts.id}) FILTER (WHERE ${receipts.status} IN ('PENDING', 'BORROWED', 'OVERDUE'))::int`,
      totalReceipts: sql<number>`count(${receipts.id})::int`,
    })
    .from(users)
    .leftJoin(receipts, eq(receipts.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return rows;
};

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { receipts, users } from "@/database/schema";
import type { ReaderWithStats, Role } from "@/types/reader";

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

export interface SessionUserState {
  id: string;
  role: Role;
}

/**
 * Trạng thái phân quyền hiện tại của người dùng, đọc thẳng từ DB.
 *
 * JWT chỉ chứa ảnh chụp role lúc đăng nhập, nên quyền vừa được cấp/thu hồi sẽ
 * không có hiệu lực cho tới khi đăng nhập lại. Đọc DB ở đây (và dùng nó trong
 * `requireAdmin`/`getAdminUser`) làm thay đổi quyền có hiệu lực ngay lập tức.
 *
 * Đồng thời ghi nhận hoạt động: `last_activity_date` được đẩy lên ngày hôm nay,
 * nhưng tối đa một lần mỗi ngày để mỗi request không thành một lượt ghi.
 */
export const getSessionUserState = async (
  userId: string,
): Promise<SessionUserState | null> => {
  const [row] = await db
    .select({ id: users.id, role: users.role, lastActivityDate: users.lastActivityDate })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  const today = new Date().toISOString().slice(0, 10);

  if (row.lastActivityDate !== today) {
    // So sánh bằng CURRENT_DATE của Postgres để không lệch ngày theo múi giờ.
    await db
      .update(users)
      .set({ lastActivityDate: sql`CURRENT_DATE` })
      .where(
        sql`${users.id} = ${userId} AND (${users.lastActivityDate} IS NULL OR ${users.lastActivityDate} < CURRENT_DATE)`,
      );
  }

  return { id: row.id, role: row.role };
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

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";

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

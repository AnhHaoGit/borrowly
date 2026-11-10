"use server";

import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { getAdminUser } from "@/lib/admin";
import type { Role } from "@/types/reader";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROLES: Role[] = ["USER", "ADMIN"];

export type ReaderRoleResult =
  | { success: true; role: Role }
  | {
      success: false;
      code: "FORBIDDEN" | "INVALID" | "NOT_FOUND" | "SELF" | "LAST_ADMIN" | "FAILED";
      message: string;
    };

/**
 * Đổi quyền của một người dùng. Hai chốt an toàn:
 *  - không tự hạ quyền chính mình (tránh tự khoá khỏi khu vực admin);
 *  - không hạ quyền admin cuối cùng còn lại.
 *
 * Vai trò cũng được ghi vào JWT lúc đăng nhập, nên người vừa được cấp quyền cần
 * đăng nhập lại để thấy mục Admin trong sidebar.
 */
export async function updateReaderRole(
  userId: string,
  role: Role,
): Promise<ReaderRoleResult> {
  const admin = await getAdminUser();

  if (!admin) {
    return {
      success: false,
      code: "FORBIDDEN",
      message: "You don't have permission to do that.",
    };
  }

  if (!UUID_RE.test(userId)) {
    return { success: false, code: "NOT_FOUND", message: "Reader not found." };
  }

  if (!ROLES.includes(role)) {
    return { success: false, code: "INVALID", message: "Unknown role." };
  }

  if (admin.id === userId) {
    return {
      success: false,
      code: "SELF",
      message: "You can't change your own role. Ask another admin to do it.",
    };
  }

  try {
    const [reader] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!reader) {
      return { success: false, code: "NOT_FOUND", message: "Reader not found." };
    }

    if (reader.role === role) {
      return { success: true, role };
    }

    if (role === "USER") {
      const [admins] = await db
        .select({ total: count() })
        .from(users)
        .where(eq(users.role, "ADMIN"));

      if (Number(admins?.total ?? 0) <= 1) {
        return {
          success: false,
          code: "LAST_ADMIN",
          message: "This is the last admin account, so it has to stay an admin.",
        };
      }
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));

    revalidatePath("/admin/readers");

    return { success: true, role };
  } catch (error) {
    console.error("Failed to update reader role:", error);

    return {
      success: false,
      code: "FAILED",
      message: "Unable to update the role. Please try again.",
    };
  }
}

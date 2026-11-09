import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export const isAdminRole = (role?: string | null): boolean => role === "ADMIN";

/**
 * Dùng trong trang/layout: người chưa đăng nhập bị đưa về trang đăng nhập, người
 * đã đăng nhập nhưng không phải admin bị đưa về /books.
 */
export async function requireAdmin(): Promise<Session["user"]> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/books");
  }

  return session.user;
}

/**
 * Dùng trong server action: trả về `null` thay vì redirect để client hiển thị
 * thông báo lỗi thay vì bị đẩy sang trang khác giữa lúc đang lưu.
 */
export async function getAdminUser(): Promise<Session["user"] | null> {
  const session = await auth();

  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return null;
  }

  return session.user;
}

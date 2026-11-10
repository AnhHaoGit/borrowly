import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSessionUserState } from "@/database/users";
import type { Session } from "next-auth";

export const isAdminRole = (role?: string | null): boolean => role === "ADMIN";

/**
 * Dùng trong trang/layout: người chưa đăng nhập bị đưa về trang đăng nhập, người
 * đã đăng nhập nhưng không phải admin bị đưa về /books.
 *
 * Quyền được đọc lại từ DB thay vì chỉ tin vào token: khi một admin bị hạ xuống
 * reader, request kế tiếp của họ đã bị chặn ngay, không phải chờ đăng nhập lại.
 */
export async function requireAdmin(): Promise<Session["user"]> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const state = await getSessionUserState(userId);

  if (!state) {
    redirect("/sign-in");
  }
  if (!isAdminRole(state.role)) {
    redirect("/books");
  }

  return { ...session.user, role: state.role };
}

/**
 * Dùng trong server action: trả về `null` thay vì redirect để client hiển thị
 * thông báo lỗi thay vì bị đẩy sang trang khác giữa lúc đang lưu.
 */
export async function getAdminUser(): Promise<Session["user"] | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const state = await getSessionUserState(userId);

  if (!state || !isAdminRole(state.role)) {
    return null;
  }

  return { ...session.user, role: state.role };
}

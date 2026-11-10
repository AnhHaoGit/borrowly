"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { notify } from "@/lib/toast";
import type { Role } from "@/types/reader";

/**
 * Theo dõi role trong session (SessionProvider làm mới định kỳ, và jwt callback
 * đọc lại role từ DB). Khi quyền thay đổi giữa chừng, người dùng được báo ngay
 * bằng toast và trang được render lại — nếu vừa bị hạ quyền khi đang ở
 * /admin/*, `requireAdmin` sẽ đưa họ về /books ở lần render đó.
 */
const RoleWatcher = () => {
  const { data } = useSession();
  const router = useRouter();
  const role = data?.user?.role;
  const previousRole = useRef<Role | null>(null);

  useEffect(() => {
    if (!role) return;

    const before = previousRole.current;
    previousRole.current = role;

    if (before === null || before === role) return;

    if (role === "ADMIN") {
      notify.success("You now have admin access", {
        description: "The Admin section is now available in the sidebar.",
      });
    } else {
      notify.info("Your admin access was removed", {
        description: "You're a reader again — your books and receipts are unchanged.",
      });
    }

    router.refresh();
  }, [role, router]);

  return null;
};

export default RoleWatcher;

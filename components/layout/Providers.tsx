"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import RoleWatcher from "@/components/layout/RoleWatcher";
import AppToaster from "@/components/ui/AppToaster";

// Session được làm mới định kỳ để thay đổi quyền (do admin khác thực hiện) hiện
// ra mà người dùng không phải tải lại trang hay đăng nhập lại.
const SESSION_REFETCH_SECONDS = 10;

/**
 * Gom mọi provider phía client vào một chỗ, bọc quanh toàn app trong app/layout.tsx.
 * Thêm provider mới (theme, query client...) thì thêm vào đây.
 */
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider refetchInterval={SESSION_REFETCH_SECONDS}>
      <RoleWatcher />
      {children}
      <AppToaster />
    </SessionProvider>
  );
};

export default Providers;

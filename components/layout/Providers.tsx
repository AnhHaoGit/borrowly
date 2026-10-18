"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import AppToaster from "@/components/ui/AppToaster";

/**
 * Gom mọi provider phía client vào một chỗ, bọc quanh toàn app trong app/layout.tsx.
 * Thêm provider mới (theme, query client...) thì thêm vào đây.
 */
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      {children}
      <AppToaster />
    </SessionProvider>
  );
};

export default Providers;

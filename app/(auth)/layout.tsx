import type { ReactNode } from "react";
import AuthCard from "@/components/auth/AuthCard";

/**
 * Layout chung cho /sign-in và /sign-up.
 * Navbar và Footer đã nằm ở app/layout.tsx nên ở đây chỉ dựng phần nội dung ở giữa.
 */
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <AuthCard>{children}</AuthCard>
    </div>
  );
};

export default AuthLayout;

import { Suspense, type ReactNode } from "react";
import { PageLoader } from "@/components/ui/Loader";
import { requireAdmin } from "@/lib/admin";

/**
 * Phần kiểm tra quyền đọc session (dữ liệu request-time) nên phải nằm trong một
 * Suspense boundary: nhờ vậy layout vẫn prerender được, còn quyền được xác minh
 * ngay khi stream. Nếu đọc `auth()` ngay ở thân layout, Next báo "encountered
 * uncached data during prerendering" và chặn việc prerender/prefetch route.
 */
const AdminGate = async ({ children }: { children: ReactNode }) => {
  await requireAdmin();

  return <>{children}</>;
};

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader label="Checking your access…" />}>
    <AdminGate>{children}</AdminGate>
  </Suspense>
);

export default AdminLayout;

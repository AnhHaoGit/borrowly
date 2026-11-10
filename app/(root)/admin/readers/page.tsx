import type { Metadata } from "next";
import ReadersExplorer from "@/components/admin/ReadersExplorer";

export const metadata: Metadata = { title: "Admin Readers" };

// Dữ liệu được tải ở client qua /api/admin/readers (route tự kiểm tra quyền),
// nhờ vậy khung trang vẫn prerender được mà không đọc DB lúc build.
const AdminReadersPage = () => <ReadersExplorer />;

export default AdminReadersPage;

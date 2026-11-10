import type { Metadata } from "next";
import TicketsExplorer from "@/components/admin/TicketsExplorer";

export const metadata: Metadata = { title: "Admin Tickets" };

// Dữ liệu được tải ở client qua /api/admin/tickets (route tự kiểm tra quyền và
// đồng bộ trạng thái quá hạn trước khi trả về).
const AdminTicketsPage = () => <TicketsExplorer />;

export default AdminTicketsPage;

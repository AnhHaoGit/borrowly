import type { Metadata } from "next";
import AdminBooksExplorer from "@/components/admin/AdminBooksExplorer";
import { GENRES } from "@/database/books";

export const metadata: Metadata = { title: "Admin Books" };

const AdminBooksPage = () => {
  return <AdminBooksExplorer genres={GENRES} />;
};

export default AdminBooksPage;

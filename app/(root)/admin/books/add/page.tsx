import type { Metadata } from "next";
import BookEditor from "@/components/admin/BookEditor";
import { GENRES } from "@/database/books";

export const metadata: Metadata = { title: "Admin Add Book" };

const AdminAddBookPage = () => {
  return <BookEditor mode="create" genres={GENRES} />;
};

export default AdminAddBookPage;

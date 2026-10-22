import type { Metadata } from "next";
import ReadersExplorer from "@/components/admin/ReadersExplorer";

export const metadata: Metadata = { title: "Admin Readers" };

const BooksPage = () => {
  return <ReadersExplorer/>;
};

export default BooksPage;
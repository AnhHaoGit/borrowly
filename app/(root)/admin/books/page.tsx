import type { Metadata } from "next";
import BooksExplorer from "@/components/admin/BooksExplorer";

export const metadata: Metadata = { title: "Admin Books" };

const BooksPage = () => {
  return <BooksExplorer/>;
};

export default BooksPage;
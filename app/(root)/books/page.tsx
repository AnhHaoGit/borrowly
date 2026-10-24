import type { Metadata } from "next";
import BooksExplorer from "@/components/books/BooksExplorer";
import { GENRES } from "../../../database/books";

export const metadata: Metadata = {
  title: "Books",
};

export default function BooksPage() {
  return <BooksExplorer genres={GENRES} />;
}

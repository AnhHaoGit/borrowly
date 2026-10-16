import type { Metadata } from "next";
import BooksExplorer from "@/components/books/BooksExplorer";
import { books, GENRES } from "../../../data/books";

export const metadata: Metadata = { title: "Books" };

const BooksPage = () => {
  return <BooksExplorer books={books} genres={GENRES} />;
};

export default BooksPage;

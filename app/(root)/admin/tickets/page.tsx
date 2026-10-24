import type { Metadata } from "next";
import TicketsExplorer from "@/components/admin/TicketsExplorer";

export const metadata: Metadata = { title: "Admin Tickets" };

const BooksPage = () => {
  return <TicketsExplorer/>;
};

export default BooksPage;
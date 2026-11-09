import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Sidebar from "../components/layout/SideBar";
import Footer from "../components/layout/Footer";
import Providers from "@/components/layout/Providers";

const bonaNova = localFont({
  src: [
    {
      path: "../public/fonts/BonaNova-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/BonaNova-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/BonaNova-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--bona-nova",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Borrowly", template: "%s | Borrowly" },
  description: "Borrowly is a book borrowing library management solution.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className={`${bonaNova.variable} h-full`}>
      <body className="min-h-full bg-background">
        <Providers>
          {/* Navbar dọc: cố định bên trái trên desktop, thanh mở menu trên mobile */}
          <Sidebar />

          <div className="flex min-h-screen flex-col md:pl-72">
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;

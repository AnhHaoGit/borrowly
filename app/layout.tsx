
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from 'react';
import Navbar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";

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
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;

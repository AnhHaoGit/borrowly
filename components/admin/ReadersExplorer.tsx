"use client"

import { Alegreya, Inter } from "next/font/google";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Pagination from "@/components/books/Pagination";
import ReaderCard, { type Reader } from "@/components/admin/ReaderCard";

const heading = Alegreya({ subsets: ["latin"], weight: ["700"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

// TODO: replace with real data (fetch from your API / database)
const readers: Reader[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  name: "Yamini Gowda",
  email: "yamini_gowda@home.com",
  dateOfBirth: "Dec 18, 2020",
  phone: "(+91) 979839999",
  address: "Kisan Warle Est, Nr Dahanukar Wadi Bunder Pakhadi Rd, Kandivali, Alwar",
  avatarUrl: `/avatars/avatar-${i + 1}.png`, // put images in /public/avatars
}));

//TODO: add actual logic
const currentPage = 1;
const totalPage = 10;
const goToPage = (p: number) => {

};

export default function ReaderExplorer() {
  return (
    <div
      className={`${heading.variable} ${body.variable} flex min-h-screen flex-col bg-[#FBF6E7] font-[family-name:var(--font-body)] text-[#5E1A2B]`}
    >

      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 md:px-10 md:py-8">
          <div className="mx-auto max-w-5xl">
            <AdminSearchBar />

            <section aria-label="Readers" className="mt-8 flex flex-col gap-4 sm:mt-12">
              {readers.map((reader) => (
                <ReaderCard key={reader.id} reader={reader} />
              ))}
            </section>

            <div className="mt-8">
              <Pagination
                current={currentPage}
                total={totalPage}
                onChange={goToPage}
              />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

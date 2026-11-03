"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/types/book";
import { Bona_Nova } from "next/font/google";
import {
  FaArrowLeft,
  FaBookOpen,
  FaBook,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaBuilding,
  FaCalendarAlt,
  FaGlobe,
  FaFileAlt,
  FaBarcode,
  FaHashtag,
  FaMapMarkerAlt,
  FaLayerGroup,
} from "react-icons/fa";

interface Props {
  book: Book;
}

const bonaNova = Bona_Nova({
  subsets: ["latin"],
  weight: ["400", "700"],
});
export default function BookDetail({ book }: Props) {
  const router = useRouter();
  const outOfStock = book.availableQuantity <= 0;
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllPublishers, setShowAllPublishers] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false)
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  return (
    <div
      className={`${bonaNova.className} min-h-screen bg-background text-primary p-4 md:p-8 flex flex-col gap-8`}
    >
      {/* Nút Back */}
      <div className="max-w-6xl mx-auto w-full flex justify-start">
        <button 
          onClick={() => router.push("/")} // Điều hướng về trang chủ
          className="p-2 hover:bg-accent/40 rounded-full transition-colors cursor-pointer"
        >
          <FaArrowLeft className="text-lg text-primary" />
        </button>
      </div>
      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 w-full flex flex-col gap-8">
        {/* 1. CARD CHÍNH - THÔNG TIN SÁCH */}
        <section className="border-2 border-[#F57F7F]/60 rounded-3xl p-6 md:p-8 bg-background/50 relative shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      
            {/* Cột Trái: Ảnh bìa sách & Nút Add to Favorites */}
            <div className="md:col-span-5 flex flex-col items-center justify-start w-full gap-4">
              <div className="bg-accent p-4 rounded-3xl w-64 flex flex-col items-center gap-4 shadow-sm">
               {/* ẢNH BÌA SÁCH */}
                 <div className="w-full aspect-3/4 bg-white/70 rounded-2xl border border-primary/20 overflow-hidden relative shadow-inner">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={`Cover of ${book.title}`}
                      fill
                      priority
                      unoptimized
                      sizes="240px"
                      className={`object-cover rounded-xl ${
                        outOfStock ? "opacity-70 grayscale-40" : ""
                      }`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs opacity-60">
                      [ẢNH SÁCH]
                    </div>
                  )}
                </div>
              </div>

              {/* Nút Add to Favorites */}
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-[200px] border border-primary/40 rounded-full py-2.5 px-4 text-xs font-bold tracking-wider text-primary bg-background flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-[#F5D0C6] hover:border-[#F5D0C6]"
              >
                {isFavorite ? (
                  <FaHeart className="text-primary text-sm" />
                ) : (
                  <FaRegHeart className="text-primary text-sm" />
                )}
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </button>
            </div>

            {/* Cột Phải: Tiêu đề, Tác giả, Category, Edition, Short Intro & About This Book */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Tiêu đề sách */}
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-primary">
                {book.title || "[BOOK TITLE]"}
              </h1>

              {/* Tác giả */}
              <p className="text-sm md:text-base font-semibold opacity-90">
                {book.authorName ? `by ${book.authorName}` : "[AUTHOR NAME]"}
            </p>

            {/* Thể loại (Category) */}
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
              <FaBookOpen className="text-base text-primary" />
              <span>{book.genre || "[BOOK CATEGORY]"}</span>
            </div>

            {/* Ấn bản / Năm xuất bản */}
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
              <FaCalendarAlt className="text-base text-primary" />
              <span>{book.publishYear ? `Edition: ${book.publishYear}` : "[EDITION / PUBLICATION]"}</span>
            </div>

            {/* ABOUT THIS BOOK */}
            <div className="pt-4 border-t border-primary/20 mt-2 flex flex-col gap-2">
              <h3 className="text-sm md:text-base font-bold tracking-wide text-primary">ABOUT THIS BOOK</h3>
              <p className="text-xs md:text-sm leading-relaxed opacity-90 text-justify">
                {book.description || book.summary || "[BOOK DESCRIPTION] Lorem ipsum dolor sit amet, consectetur adipiscing elit..."}
              </p>
            </div>
          </div>
        </div>

        {/* Đường kẻ ngang ngăn cách */}
        <div className="w-full h-[1px] bg-primary/20 my-8"></div>

        {/* PHẦN DƯỚI: 2 CỘT (PUBLICATION INFORMATION & STATUS & BORROWING) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* CỘT TRÁI: PUBLICATION INFORMATION */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm md:text-base font-bold tracking-wide text-primary">
              PUBLICATION INFORMATION
            </h3>
            
            <div className="flex flex-col gap-3 text-xs md:text-sm">
              {/* Publisher */}
              <div className="flex items-start justify-between py-2 border-b border-primary/10 gap-4">
                <div className="flex items-center gap-2.5 opacity-80 shrink-0">
                  <FaBuilding className="text-base text-primary" />
                  <span className="font-medium">PUBLISHER</span>
                </div>

                <div className="text-center flex flex-col items-center gap-1 flex-1 max-w-[280px]">
                  {(() => {
                    const rawPublisher = (book?.publishers ?? "[PUBLISHER]") as string | string[];
                    let publishersList: string[] = [];
                    if (Array.isArray(rawPublisher)) {
                      publishersList = rawPublisher.map(String);
                    } else if (typeof rawPublisher === "string") {
                      publishersList = rawPublisher.split(/,|\n/).map(p => p.trim()).filter(Boolean);
                    } else {
                      publishersList = [String(rawPublisher)];
                    }

                    const visiblePublishers = showAllPublishers ? publishersList : publishersList.slice(0, 2);
                    const hasMore = publishersList.length > 2;

                    return (
                      <>
                        <div className="flex flex-col items-center gap-1 w-full">
                          {visiblePublishers.map((pub, idx) => (
                            <span key={idx} className="font-semibold block text-center leading-snug">
                              {pub}
                            </span>
                          ))}
                        </div>

                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => setShowAllPublishers(!showAllPublishers)}
                            className="text-xs text-primary font-medium hover:underline mt-1 cursor-pointer"
                          >
                            {showAllPublishers ? "− show less" : `+ ${publishersList.length - 2} more`}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Publication Year */}
              <div className="flex items-center justify-between py-1.5 border-b border-primary/10">
                <div className="flex items-center gap-2.5 opacity-80">
                  <FaCalendarAlt className="text-base text-primary" />
                  <span className="font-medium">PUBLICATION YEAR</span>
                </div>
                <span className="font-semibold">{book.publishYear || "[PUBLICATION YEAR]"}</span>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between py-1.5 border-b border-primary/10">
                <div className="flex items-center gap-2.5 opacity-80">
                  <FaGlobe className="text-base text-primary" />
                  <span className="font-medium">LANGUAGE</span>
                </div>
                <span className="font-semibold">{book.language || "[LANGUAGE]"}</span>
              </div>

              {/* Category */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5 opacity-80">
                  <FaBookOpen className="text-base text-primary" />
                  <span className="font-medium">CATEGORY</span>
                </div>
                <span className="font-semibold">{book.genre || "[CATEGORY]"}</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: STATUS & BORROWING */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm md:text-base font-bold tracking-wide text-primary">
              STATUS & BORROWING
            </h3>

            {/* Dynamic Status Switch Pill */}
            <div className="inline-flex items-center rounded-full bg-primary/10 p-1 w-fit border border-primary/20">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                  !outOfStock
                    ? "bg-primary text-background shadow-sm"
                    : "text-primary/60 bg-transparent"
                }`}
              >
                AVAILABLE
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                  outOfStock
                    ? "bg-primary text-background shadow-sm"
                    : "text-primary/60 bg-transparent"
                }`}
              >
                CHECKED OUT
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs md:text-sm pt-2">
              {/* Available Copies */}
              <div className="flex items-center justify-between py-1.5 border-b border-primary/10">
                <div className="flex items-center gap-2.5 opacity-80">
                  <FaBook className="text-base text-primary" />
                  <span className="font-medium">AVAILABLE COPIES</span>
                </div>
                <span className="font-semibold">
                  {(book as any)?.availableCopies ?? (book as any)?.copies ?? (outOfStock ? 0 : 1)}
                </span>
              </div>

              {/* Nút Check out / Borrow book */}
              <div className="mt-4 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setIsCheckedOut(true);
                    alert("Đã gửi yêu cầu mượn sách thành công!");
                  }}
                  style={{
                    backgroundColor: isCheckedOut ? "#F3A7A7" : "#F5D0C6",
                  }}
                  className="w-full rounded-full py-3 text-xs md:text-sm font-bold tracking-wider text-primary transition-all shadow-sm cursor-pointer hover:opacity-90 active:scale-[0.99]"
                >
                  {isCheckedOut ? "CHECKED OUT / BORROWED" : "CHECK OUT / BORROW BOOK"}
                </button>
                <p className="text-xs opacity-70 text-center">
                  Please login to borrow this book.
                </p>
              </div>
            </div>
          </div>
        </div>
         {/*SUBJECTS */}
        <div className="mt-8 pt-6 border-t border-primary/20 flex flex-col gap-4 w-full">
          <h3 className="text-sm md:text-base font-bold tracking-wide text-primary">
            SUBJECTS
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 w-full">
            {(() => {
              const rawSubjects = (book?.subjects ?? [
                "Poetry", 
                "Hell", 
                "Illustrations", 
                "Iconography", 
                "Translations into English"
              ]) as string | string[];

              let subjectsList: string[] = [];
              if (Array.isArray(rawSubjects)) {
                subjectsList = rawSubjects.map(String);
              } else if (typeof rawSubjects === "string") {
                subjectsList = rawSubjects.split(/,|\n/).map(s => s.trim()).filter(Boolean);
              } else {
                subjectsList = [String(rawSubjects)];
              }

              return subjectsList.map((subj, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    router.push(`/books?subject=${encodeURIComponent(subj)}`);
                  }}
                  className="border border-primary/40 rounded-full px-4 py-1.5 text-xs font-medium text-primary bg-background/50 hover:bg-[#F5D0C6] hover:border-[#F5D0C6] transition-all cursor-pointer"
                >
                  {subj}
                </button>
              ));
            })()}
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}

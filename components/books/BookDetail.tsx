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
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full flex flex-col gap-8">
        {/* 1. CARD CHÍNH - THÔNG TIN SÁCH */}
        <section className="border-2 border-[#F57F7F]/60 rounded-3xl p-6 md:p-8 bg-background/50 relative shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI: Bìa sách từ Database, Nút Borrow & Box From the Archive */}
            <div className="md:col-span-5 flex flex-col items-center gap-6">
              {/* 1. Khung hiển thị Bìa sách */}
              <div className="relative w-full max-w-[320px] aspect-[3/4] bg-[#f5d0c6] p-3 rounded-sm shadow-md flex items-center justify-center overflow-hidden">
                {book.coverUrl ? (
                  /* Nếu database có URL ảnh bìa */
                  <div className="relative w-full h-full">
                    <Image
                      src={book.coverUrl}
                      alt={book.title || "Book Cover"}
                      fill
                      className="object-cover rounded-sm border border-[#EEB3A3]"
                    />
                  </div>
                ) : (
                  /* Nếu không có ảnh, hiển thị khung thiết kế cổ điển tự động điền từ DB */
                  <div className="relative w-full h-full bg-[#62202f] text-[#fbf7e8] p-6 border border-[#EEB3A3]/40 flex flex-col justify-between items-center text-center">
                    {/* 4 Họa tiết hình thoi góc bìa */}
                    <span className="absolute top-1.5 left-1.5 text-[10px] text-[#EEB3A3]">
                      ✦
                    </span>
                    <span className="absolute top-1.5 right-1.5 text-[10px] text-[#EEB3A3]">
                      ✦
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] text-[#EEB3A3]">
                      ✦
                    </span>
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] text-[#EEB3A3]">
                      ✦
                    </span>

                    {/* Thể loại hoặc tên phụ từ DB */}
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#EEB3A3] pt-2">
                      {book.genre || "Classic Literature"}
                    </div>

                    {/* Tên sách & Tác giả lấy từ biến book */}
                    <div className="my-auto space-y-4 px-2">
                      <div className="w-10 h-10 mx-auto border border-[#EEB3A3] rotate-45 flex items-center justify-center">
                        <span className="-rotate-45 text-xs text-[#EEB3A3]">
                          ✦
                        </span>
                      </div>

                      <h1 className="text-2xl md:text-3xl font-bold tracking-wider uppercase text-[#fbf7e8] line-clamp-3">
                        {book.title}
                      </h1>

                      <p className="text-xs uppercase tracking-[0.15em] text-[#EEB3A3]">
                        {book.authorName}
                      </p>
                    </div>

                    {/* Line trang trí dưới bìa */}
                    <div className="w-20 h-[1px] bg-[#EEB3A3]/40 mb-2"></div>
                  </div>
                )}
              </div>

              {/* 2. Nút Borrow Book / Return Book */}
              <button
                onClick={() => setIsCheckedOut(!isCheckedOut)}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-[#62202f] bg-[#fbf7e8] hover:bg-[#f5d0c6] transition-colors text-sm font-semibold text-[#62202f] shadow-sm cursor-pointer"
              >
                <FaBookOpen className="text-xs text-[#62202f]" />
                <span>{isCheckedOut ? "Return Book" : "Borrow Book"}</span>
              </button>

              {/* 3. Box Trích dẫn "FROM THE ARCHIVE" */}
              <div className="w-full max-w-[320px] bg-[#f5d0c6]/60 p-4 border-l-2 border-[#62202f]/80 text-left">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1 text-[#62202f]">
                  From the Archive
                </h4>
                <p className="text-xs italic leading-relaxed text-[#62202f]/90">
                  A journey through the first canticle of Dante&apos;s enduring
                  literary masterpiece.
                </p>
              </div>
            </div>
            {/* CỘT PHẢI: Phần đầu (Tiêu đề, Tác giả, Tag) */}
            <div className="md:col-span-7 flex flex-col gap-8">
              {/* Header: Thanh ngang liền mạch và ngôi sao ✦ */}
              <div className="space-y-4 pt-2">
                <div className="relative w-full flex items-center">
                  {/* Thanh ngang kéo dài liên tục */}
                  <div className="absolute inset-x-0 h-[1px] bg-[#EEB3A3]"></div>
                  {/* Ngôi sao nằm ở phía bên phải */}
                  <span className="ml-auto relative z-10 bg-[#fbf7e8] pl-2 text-sm text-[#EEB3A3]">
                    ✦
                  </span>
                </div>

                {/* Tên sách từ Database */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#62202f]">
                  {book.title}
                </h1>

                {/* Tác giả & Ảnh đại diện tác giả từ Database */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#f5d0c6] border border-[#EEB3A3] flex items-center justify-center text-xs font-bold text-[#62202f]">
                    {book.authorImageUrl ? (
                      <Image
                        src={book.authorImageUrl}
                        alt={book.authorName || "Author"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>
                        {book.authorName ? book.authorName.charAt(0) : "A"}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-medium text-[#62202f]">
                    by <span className="font-semibold">{book.authorName}</span>
                  </span>
                </div>

                {/* Các Badges Tag lấy từ Database (Genre & Publish Year) */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {book.genre && (
                    <div className="flex items-center gap-2 border border-[#62202f] bg-[#fbf7e8] px-3 py-1 text-xs uppercase tracking-wider text-[#62202f]">
                      <FaBookOpen className="text-xs" />
                      <span>{book.genre}</span>
                    </div>
                  )}
                  {book.publishYear && (
                    <div className="flex items-center gap-2 border border-[#62202f] bg-[#fbf7e8] px-3 py-1 text-xs uppercase tracking-wider text-[#62202f]">
                      <FaCalendarAlt className="text-xs" />
                      <span>Edition: {book.publishYear}</span>
                    </div>
                  )}
                </div>
              </div>
              <hr className="border-[#EEB3A3]" />
              {/* SECTION: BOOK SUMMARY */}
              <div className="space-y-3 pt-4">
                <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-[#62202f]">
                  <FaBookOpen className="text-sm text-[#62202f]" />
                  <span>Book Summary</span>
                </h3>
                <p className="text-base leading-relaxed text-[#62202f]/90">
                  {book.description ||
                    book.summary ||
                    "No summary available for this book."}
                </p>
              </div>
              <hr className="border-[#EEB3A3] my-6" />
              {/* SECTION: PUBLICATION INFORMATION */}
              <section className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#62202f]">
                  <span className="text-xs text-[#F57F7F]">✦</span>
                  <h3>Publication Information</h3>
                  <div className="h-[1px] bg-[#EEB3A3] flex-1 ml-2"></div>
                </div>

                {/* Khung chứa chi tiết kỹ thuật có viền góc nghệ thuật */}
                <div className="border border-[#EEB3A3] bg-[#fbf7e8] p-6 space-y-4 relative text-xs md:text-sm">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#62202f]"></div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#62202f]"></div>

                  {/* Publisher */}
                  <div className="flex items-start justify-between border-b border-[#EEB3A3]/50 pb-3">
                    <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#62202f]">
                      <FaBuilding />
                      <span>Publisher</span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {(() => {
                        const rawPublisher = (book?.publishers ??
                          book?.publishers ??
                          "[PUBLISHER]") as string | string[];
                        let publishersList: string[] = [];

                        if (Array.isArray(rawPublisher)) {
                          publishersList = rawPublisher.map(String);
                        } else if (typeof rawPublisher === "string") {
                          publishersList = rawPublisher
                            .split(/,|\n/)
                            .map((p) => p.trim())
                            .filter(Boolean);
                        } else {
                          publishersList = [String(rawPublisher)];
                        }

                        const visiblePublishers = showAllPublishers
                          ? publishersList
                          : publishersList.slice(0, 2);
                        const hasMore = publishersList.length > 2;

                        return (
                          <>
                            <div className="flex flex-col items-end gap-1 text-[#62202f]">
                              {visiblePublishers.map((pub, idx) => (
                                <span
                                  key={idx}
                                  className="font-semibold block text-right leading-snug"
                                >
                                  {pub}
                                </span>
                              ))}
                            </div>

                            {hasMore && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAllPublishers(!showAllPublishers)
                                }
                                className="text-xs text-[#F57F7F] font-bold hover:underline mt-1 cursor-pointer"
                              >
                                {showAllPublishers
                                  ? "− Show less"
                                  : `+ ${publishersList.length - 2} more`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Publication Year */}
                  <div className="flex justify-between items-center border-b border-[#EEB3A3]/50 pb-3">
                    <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#62202f]">
                      <FaCalendarAlt />
                      <span>Publication Year</span>
                    </div>
                    <span>{book.publishYear || "N/A"}</span>
                  </div>

                  {/* Language */}
                  <div className="flex justify-between items-center border-b border-[#EEB3A3]/50 pb-3">
                    <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#62202f]">
                      <FaGlobe />
                      <span>Language</span>
                    </div>
                    <span className="uppercase">{book.language || "eng"}</span>
                  </div>

                  {/* Category */}
                  <div className="flex justify-between items-center border-b border-[#EEB3A3]/50 pb-3">
                    <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#62202f]">
                      <FaBookmark />
                      <span>Category</span>
                    </div>
                    <span>{book.genre || "General"}</span>
                  </div>

                  {/* Subjects */}
                  {book.subjects && book.subjects.length > 0 && (
                    <div className="border-b border-[#EEB3A3]/50 pb-3 space-y-1">
                      <div className="font-semibold uppercase tracking-wider text-[#62202f]">
                        Subjects
                      </div>
                      <p className="italic text-[#62202f]/80">
                        {book.subjects.join(" · ")}
                      </p>
                    </div>
                  )}

                  {/* Subject Places */}
                  {book.subjectPlaces && book.subjectPlaces.length > 0 && (
                    <div className="border-b border-[#EEB3A3]/50 pb-3 space-y-1">
                      <div className="font-semibold uppercase tracking-wider text-[#62202f]">
                        Subject Places
                      </div>
                      <p className="italic text-[#62202f]/80">
                        {book.subjectPlaces.join(" · ")}
                      </p>
                    </div>
                  )}

                  {/* Subject Times */}
                  {book.subjectTimes && book.subjectTimes.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold uppercase tracking-wider text-[#62202f]">
                        Subject Times
                      </div>
                      <p className="italic text-[#62202f]/80">
                        {book.subjectTimes.join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

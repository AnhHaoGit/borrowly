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
                    <span className="absolute top-1.5 left-1.5 text-[10px] text-[#EEB3A3]">✦</span>
                    <span className="absolute top-1.5 right-1.5 text-[10px] text-[#EEB3A3]">✦</span>
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] text-[#EEB3A3]">✦</span>
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] text-[#EEB3A3]">✦</span>

                    {/* Thể loại hoặc tên phụ từ DB */}
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#EEB3A3] pt-2">
                      {book.genre || "Classic Literature"}
                    </div>

                    {/* Tên sách & Tác giả lấy từ biến book */}
                    <div className="my-auto space-y-4 px-2">
                      <div className="w-10 h-10 mx-auto border border-[#EEB3A3] rotate-45 flex items-center justify-center">
                        <span className="-rotate-45 text-xs text-[#EEB3A3]">✦</span>
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
                  A journey through the first canticle of Dante's enduring literary masterpiece.
                </p>
              </div>
            </div>
        </div>
      </section>
    </div>
    </div>
  );
}

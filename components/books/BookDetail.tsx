"use client";

import Image from "next/image";
import { useState } from "react";
import { coverUrl } from "@/lib/books";
import type { Book } from "@/database/books";
import { Bona_Nova } from "next/font/google";
import {
  FaArrowLeft,
  FaBookOpen,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";

interface Props {
  book: Book;
}

const bonaNova = Bona_Nova({
  subsets: ["latin"],
  weight: ["400", "700"],
});
export default function BookDetail({ book }: Props) {
  const outOfStock = book.available_quantity <= 0;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  return (
    <div
      className={`${bonaNova.className} min-h-screen bg-[#fbf7e8] text-[#62202f] p-4 md:p-8 flex flex-col gap-8`}
    >
      {/* Nút Back */}
      <div className="max-w-6xl mx-auto w-full flex justify-start">
        <button className="p-2 hover:bg-[#f5d0c6]/40 rounded-full transition-colors">
          <FaArrowLeft className="text-lg text-[#62202f]" />
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        {/* 1. CARD CHÍNH - THÔNG TIN SÁCH */}
        <section className="border-2 border-[#F57F7F]/60 rounded-3xl p-6 md:p-8 bg-[#fbf7e8]/50 relative shadow-sm">
          {/* Tag Category */}
          <div className="flex items-center gap-2 text-lg font-bold mb-6 w-fit cursor-pointer hover:scale-105 transition-transform">
            <FaBookOpen className="text-xl" />
            <span>Category: Novel</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Cột Trái: Ảnh bìa sách & Nút tương tác */}
            <div className="md:col-span-5 flex flex-col items-center justify-start w-full">
              <div className="bg-[#f5d0c6] p-4 rounded-3xl w-64 flex flex-col items-center gap-4 shadow-sm">
                {/*ẢNH BÌA SÁCH */}
                <div className="w-full aspect-[3/4] bg-white/70 rounded-2xl border border-[#62202f]/20 overflow-hidden relative shadow-inner">
                  {book.cover_id ? (
                    <Image
                      src={coverUrl(book.cover_id)}
                      alt={`Cover of ${book.title}`}
                      fill
                      unoptimized
                      sizes="240px"
                      className={`object-cover rounded-xl ${
                        outOfStock ? "opacity-70 grayscale-[40%]" : ""
                      }`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs opacity-60">
                      [ẢNH SÁCH]
                    </div>
                  )}
                </div>

                {/* Các nút tương tác bên dưới ảnh */}
                <div className="w-full flex flex-row items-center justify-between pt-2">
                  <button className="bg-[#62202f] text-[#fbf7e8] text-xs px-4 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all">
                    Check out
                  </button>
                  <div className="flex flex-row items-center gap-3 text-lg text-[#62202f]"></div>

                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="hover:scale-110 transition-transform focus:outline-none"
                  >
                    {isLiked ? (
                      <FaHeart className="text-[#62202f]" />
                    ) : (
                      <FaRegHeart className="text-[#62202f]" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="hover:scale-110 transition-transform focus:outline-none"
                  >
                    {isSaved ? (
                      <FaBookmark className="text-[#62202f]" />
                    ) : (
                      <FaRegBookmark className="text-[#62202f]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Cột Phải: Mô tả sách & Nút Mua */}
            <div className="md:col-span-7 flex flex-col justify-between h-full gap-6">
              {/* Phần Về Tác Giả (About This Book) */}
              <div className="pt-4 border-t border-[#62202f]/10 max-w-xl pr-4">
                <h3 className="text-lg font-bold mb-2">About This Book</h3>
                <p className="text-xs md:text-sm leading-relaxed opacity-90 text-justify">
                  {book.description ||
                    book.summary ||
                    "Chưa có thông tin mô tả."}
                </p>
              </div>
              <div>
                <button className="border border-[#62202f] rounded-full px-5 py-2 text-xs md:text-sm font-semibold flex items-center gap-2 hover:bg-[#62202f] hover:text-[#fbf7e8] transition-all">
                  <FaShoppingCart />
                  <span>Secure copy online now</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CARD THÔNG TIN TÁC GIẢ & THỂ LOẠI */}
        <section className="bg-[#f5d0c6]/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          {/* Tác Giả */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="w-24 h-24 rounded-full bg-white border-2 border-[#F57F7F] flex items-center justify-center overflow-hidden relative shadow-sm">
              {book.author_avatar ? (
                <Image
                  src={book.author_avatar}
                  alt={book.author_name || "Author"}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] text-center p-2 opacity-50">
                  [ẢNH AVATAR]
                </span>
              )}
            </div>
            <span className="font-bold text-xs tracking-wider text-center">
              {book.author_name || "Unknown Author"}
            </span>
          </div>

          {/* Chi tiết Subjects & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-xs md:text-sm mr-2">
              SUBJECTS :
            </span>

            {book.genre ? (
              book.genre.split(",").map((subj, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 rounded-full bg-[#f2c6c2]/60 text-[#62202f] text-xs font-medium shadow-sm"
                >
                  {subj.trim()}
                </span>
              ))
            ) : (
              <span className="text-xs opacity-60">No subjects available</span>
            )}

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="mr-2">STATUS :</span>

              {/* Nút AVAILABLE: Sáng màu hồng khi available_quantity > 0, ngược lại màu be */}
              <button
                className={`px-5 py-2 rounded-full font-bold shadow-sm transition-colors ${
                  book.available_quantity > 0
                    ? "bg-[#F57F7F] text-[#62202f]"
                    : "bg-[#fbf7e8]/60 text-[#62202f]/60 font-normal"
                }`}
              >
                AVAILABLE
              </button>

              {/* Nút CHECKED OUT: Sáng màu hồng khi available_quantity <= 0, ngược lại màu be */}
              <button
                className={`px-5 py-2 rounded-full font-bold shadow-sm transition-colors ${
                  book.available_quantity <= 0
                    ? "bg-[#F57F7F] text-[#62202f]"
                    : "bg-[#fbf7e8]/60 text-[#62202f]/60 font-normal"
                }`}
              >
                CHECKED OUT
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

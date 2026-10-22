"use client";

import Image from "next/image";

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  status: "Available" | "Borrowed" | string;
  coverUrl: string;
};

export default function BookCard({ book }: { book: Book }) {
  const handleDelete = () => {
    // TODO: confirm, then call your delete API for `book.id` and refresh the list
    console.log("delete book", book.id);
  };

  const details = [
    { label: "Author", value: book.author },
    { label: "Category", value: book.category },
    { label: "Status", value: book.status },
  ];

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[#D9A9A3] p-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
      {/* Cover + title */}
      <div className="flex items-center gap-4 sm:w-72 sm:shrink-0">
        <Image
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          width={52}
          height={70}
          className="h-[70px] w-[52px] shrink-0 object-cover shadow-md"
        />
        <div className="min-w-0 font-[family-name:var(--font-heading)] font-bold leading-tight text-[#6B1D2E]">
          <h2 className="text-base">{book.title}</h2>
          {book.subtitle && <p className="text-sm">{book.subtitle}</p>}
        </div>
      </div>

      {/* Details */}
      <dl className="grid flex-1 grid-cols-2 content-center gap-x-6 gap-y-1 text-[11px]">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-semibold text-[#E0414F]">{label}</dt>
            <dd className="text-[#222]">{value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleDelete}
        className="self-end font-[family-name:var(--font-heading)] text-base font-bold text-[#6B1D2E] hover:underline sm:self-auto sm:px-2"
      >
        Delete
      </button>
    </article>
  );
}

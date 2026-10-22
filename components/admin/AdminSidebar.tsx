"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Books", href: "/admin/books" },
  { label: "Readers", href: "/admin/readers" },
  { label: "Tickets", href: "/admin/tickets" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="flex gap-6 border-b border-[#C98F93] px-5 py-3 md:w-52 md:shrink-0 md:flex-col md:gap-5 md:border-b-0 md:border-r md:px-10 md:py-0 md:pt-4"
    >
      {links.map(({ label, href }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "font-bold text-[#5E1A2B]"
                : "text-[#C9A9A4] transition-colors hover:text-[#6B1D2E]"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

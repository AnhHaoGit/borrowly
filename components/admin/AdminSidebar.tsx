"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/books", label: "Books" },
  { href: "/admin/readers", label: "Readers" },
  { href: "/admin/tickets", label: "Tickets" },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="px-4 pt-8 sm:px-6 md:w-60 md:shrink-0 md:pr-0">
      {/* Horizontal pill on mobile, vertical on md+ (same look as the Navbar pill) */}
      <nav
        aria-label="Admin sections"
        className="flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-full border-2 border-accent-deep bg-accent p-1.5 shadow-soft md:sticky md:top-28 md:w-full md:flex-col md:items-stretch md:rounded-3xl"
      >
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`rounded-full px-5 py-2 text-base transition md:text-center ${
              isActive(href)
                ? "bg-surface font-bold text-primary shadow-sm"
                : "text-primary/80 hover:bg-surface/60 hover:text-primary"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;

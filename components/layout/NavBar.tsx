"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { LuBookOpen, LuLoader, LuLogOut, LuMenu, LuX } from "react-icons/lu";
import AnonymousAvatar from "@/components/ui/AnonymousAvatar";
import { useSignOut } from "@/hooks/useSignOut";
import UserMenu from "../ui/UserMenu";

const LINKS = [
  { href: "/books", label: "Books" },
  { href: "/profile", label: "Profile" },
];

const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { signOutUser, pending } = useSignOut();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Chưa có `overflow-hidden` ở header: ô avatar bung ra phía dưới navbar sẽ bị cắt mất nếu có.
  return (
    <header className="sticky top-0 z-40  rounded-b-3xl border border-t-0 border-accent/60 bg-linear-to-r from-background from-0% to-accent to-55% shadow-soft">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/books"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary shadow-soft">
            <LuBookOpen className="size-5" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-primary">
            Borrowly
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-2 rounded-full border-2 border-accent-deep bg-accent p-1.5 shadow-soft md:flex"
        >
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`rounded-full px-5 py-2 text-base transition ${
                isActive(href)
                  ? "bg-surface font-bold text-primary shadow-sm"
                  : "text-primary/80 hover:bg-surface/60 hover:text-primary"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Đang kiểm tra phiên → giữ chỗ để nút Login không nháy lên rồi biến mất */}
          {status === "loading" ? (
            <span
              aria-hidden="true"
              className="ml-1 size-10 animate-pulse rounded-full bg-surface/70"
            />
          ) : session ? (
            <div className="ml-1">
              <UserMenu />
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="ml-1 rounded-full bg-primary px-6 py-2 text-base text-background transition hover:bg-secondary"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 place-items-center rounded-full border-2 border-accent-deep bg-accent text-primary md:hidden"
        >
          {open ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu: tự bo góc dưới vì header không còn overflow-hidden */}
      {open && (
        <nav
          aria-label="Mobile"
          className="rounded-b-3xl border-t border-accent-deep/40 bg-background px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-2">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-lg ${
                    isActive(href)
                      ? "bg-accent font-bold text-primary"
                      : "text-secondary hover:bg-accent/50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}

            <li>
              {status === "loading" ? null : session ? (
                <div className="rounded-xl border border-accent-deep/40 bg-surface p-3">
                  <div className="flex items-center gap-3">
                    <AnonymousAvatar className="size-11" />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold leading-tight text-primary">
                        {session.user?.name ?? "Reader"}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={async () => {
                      await signOutUser();
                      setOpen(false);
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-base text-primary transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? (
                      <LuLoader className="size-5 animate-spin" />
                    ) : (
                      <LuLogOut className="size-5" />
                    )}
                    {pending ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-primary px-4 py-3 text-center text-lg text-background"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

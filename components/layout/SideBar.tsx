"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import type { IconType } from "react-icons";
import {
  LuBookOpen,
  LuLibrary,
  LuLoader,
  LuLogOut,
  LuMenu,
  LuReceipt,
  LuUser,
  LuUsers,
  LuX,
} from "react-icons/lu";
import AnonymousAvatar from "@/components/ui/AnonymousAvatar";
import { useSignOut } from "@/hooks/useSignOut";

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

const NAV_LINKS: NavItem[] = [
  { href: "/books", label: "Books", icon: LuLibrary },
  { href: "/profile", label: "Profile", icon: LuUser },
];

const ADMIN_LINKS: NavItem[] = [
  { href: "/admin/books", label: "Manage books", icon: LuBookOpen },
  { href: "/admin/readers", label: "Readers", icon: LuUsers },
  { href: "/admin/tickets", label: "Tickets", icon: LuReceipt },
];

const isActive = (pathname: string | null, href: string) =>
  pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

const NavLink = ({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string | null;
  onNavigate?: () => void;
}) => {
  const { href, label, icon: Icon } = item;
  const active = isActive(pathname, href);

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-base transition ${
          active
            ? "bg-surface font-bold text-primary shadow-soft"
            : "text-primary/80 hover:bg-surface/70 hover:text-primary"
        }`}
      >
        <Icon className="size-5 shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
};

interface PanelProps {
  pathname: string | null;
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  onNavigate?: () => void;
}

const SidebarPanel = ({ pathname, session, status, onNavigate }: PanelProps) => {
  const { signOutUser, pending } = useSignOut();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 px-4 py-6">
      <Link
        href="/books"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2"
      >
        <span className="grid size-10 place-items-center rounded-full bg-accent text-primary shadow-soft">
          <LuBookOpen className="size-5" />
        </span>
        <span className="text-2xl font-bold tracking-tight text-primary">
          Borrowly
        </span>
      </Link>

      <nav
        aria-label="Main"
        className="rounded-3xl border-2 border-accent-deep/70 bg-accent/80 p-2 shadow-soft"
      >
        <ul className="space-y-1">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>

      {/* Khu vực quản trị chỉ hiện với tài khoản role ADMIN */}
      {isAdmin && (
        <div>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Admin
          </p>
          <nav aria-label="Admin sections">
            <ul className="space-y-1">
              {ADMIN_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </nav>
        </div>
      )}

      <div className="mt-auto">
        {status === "loading" ? (
          <div
            aria-hidden="true"
            className="h-24 animate-pulse rounded-2xl bg-accent/60"
          />
        ) : session ? (
          <div className="rounded-2xl border border-accent-deep/40 bg-surface/85 p-3">
            <div className="flex items-center gap-3">
              <AnonymousAvatar className="size-11" />
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-tight text-primary">
                  {session.user?.name ?? "Reader"}
                </p>
                <p className="truncate text-xs text-muted">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={signOutUser}
              disabled={pending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm text-primary transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <LuLoader className="size-4 animate-spin" />
              ) : (
                <LuLogOut className="size-4" />
              )}
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <Link
            href="/sign-in"
            onClick={onNavigate}
            className="block rounded-2xl bg-primary px-4 py-3 text-center text-base text-background transition hover:bg-secondary"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

// `usePathname()` chỉ đọc được URL ở runtime nên phải nằm trong Suspense, nếu
// không Next.js sẽ chặn prerender toàn bộ layout.
const SidebarFrame = ({ pathname }: { pathname: string | null }) => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Navbar dọc cố định, sát mép trái trên desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto border-r border-accent-deep/40 bg-linear-to-b from-surface via-background to-accent/60 md:block">
        <SidebarPanel pathname={pathname} session={session} status={status} />
      </aside>

      {/* Mobile: logo + nút mở menu, sidebar trượt vào từ trái */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-accent-deep/40 bg-background/95 px-4 backdrop-blur md:hidden">
        <Link href="/books" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-accent text-primary">
            <LuBookOpen className="size-4" />
          </span>
          <span className="text-xl font-bold tracking-tight text-primary">
            Borrowly
          </span>
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-full border-2 border-accent-deep bg-accent text-primary"
        >
          <LuMenu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-72 max-w-[85%] flex-col overflow-y-auto bg-background shadow-lift">
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-full border-2 border-accent-deep bg-accent text-primary"
              >
                <LuX className="size-5" />
              </button>
            </div>
            <SidebarPanel
              pathname={pathname}
              session={session}
              status={status}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const SidebarWithPathname = () => {
  const pathname = usePathname();

  return <SidebarFrame pathname={pathname} />;
};

const Sidebar = () => (
  <Suspense fallback={<SidebarFrame pathname={null} />}>
    <SidebarWithPathname />
  </Suspense>
);

export default Sidebar;

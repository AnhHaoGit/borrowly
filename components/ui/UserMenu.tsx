"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { LuLoader, LuLogOut } from "react-icons/lu";
import AnonymousAvatar from "@/components/ui/AnonymousAvatar";
import { useSignOut } from "@/hooks/useSignOut";

const UserMenu = () => {
  const { data: session } = useSession();
  const { signOutUser, pending } = useSignOut();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus(); // trả focus về nút để người dùng bàn phím không bị lạc
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const name = session?.user?.name ?? "Reader";
  const email = session?.user?.email ?? "";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex justify-center items-center rounded-full ring-2 ring-offset-2 ring-offset-accent transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
          open ? "ring-primary" : "ring-transparent hover:ring-primary/40"
        }`}
      >
        <AnonymousAvatar className="size-10" />
      </button>

      {/* Luôn nằm trong DOM để có hiệu ứng mờ dần; `invisible` giúp ẩn với cả bàn phím và trình đọc màn hình */}
      <div
        id={panelId}
        className={`absolute right-0 top-full z-50 mt-4 w-72 origin-top-right rounded-2xl border-2 border-accent bg-surface p-4 shadow-lift transition-[opacity,transform,visibility] duration-150 ${
          open
            ? "visible scale-100 opacity-100"
            : "invisible pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <AnonymousAvatar className="size-12" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight text-primary">
              {name}
            </p>
            <p className="truncate text-sm text-muted">{email}</p>
          </div>
        </div>

        <hr className="my-3 border-accent" />

        <button
          type="button"
          onClick={signOutUser}
          disabled={pending}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base text-primary transition hover:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <LuLoader className="size-5 animate-spin" />
          ) : (
            <LuLogOut className="size-5" />
          )}
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
};

export default UserMenu;

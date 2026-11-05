"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LuBookmarkPlus,
  LuCheck,
  LuClock,
  LuLoaderCircle,
  LuTriangleAlert,
} from "react-icons/lu";
import { borrowBook } from "@/app/actions/borrow";
import { BORROW_LIMIT } from "@/lib/receipts";
import { notify } from "@/lib/toast";
import type { BorrowStatus } from "@/types/ticket";

interface Props {
  bookId: string;
  bookTitle: string;
  // Trạng thái phiếu người xem đang giữ cho cuốn này (null = chưa mượn).
  status: BorrowStatus | null;
  available: boolean;
  limitReached: boolean;
  isAuthenticated: boolean;
  label: string;
  size?: "sm" | "md";
  className?: string;
  onBorrowed?: (bookId: string) => void;
}

const BASE =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border text-sm transition";

const formatDeadline = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "the pickup deadline";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BorrowButton = ({
  bookId,
  bookTitle,
  status,
  available,
  limitReached,
  isAuthenticated,
  label,
  size = "sm",
  className = "",
  onBorrowed,
}: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Giữ nút ở trạng thái "Pending pickup" ngay sau khi mượn, trước khi props
  // (hoặc lần fetch lại) mang trạng thái thật về.
  const [justBorrowed, setJustBorrowed] = useState(false);

  const classes = `${BASE} ${size === "md" ? "h-11" : "h-10"} ${className}`;

  const handleBorrow = () => {
    startTransition(async () => {
      const result = await borrowBook(bookId);

      if (!result.success) {
        notify.error(result.message);

        // Phiên đã hết hạn ở server: làm mới để UI chuyển về trạng thái khách.
        if (result.code === "UNAUTHENTICATED") router.refresh();

        return;
      }

      setJustBorrowed(true);
      notify.success("Receipt created", {
        description: `Pick up "${bookTitle}" by ${formatDeadline(
          result.pickupDeadline,
        )}.`,
      });
      onBorrowed?.(bookId);
      router.refresh();
    });
  };

  const current: BorrowStatus | null = justBorrowed ? "PENDING" : status;

  if (current === "PENDING") {
    return (
      <span
        title="Waiting for the librarian to hand the book over."
        className={`${classes} cursor-default border-accent-deep bg-accent text-primary`}
      >
        <LuClock className="size-4" />
        Pending pickup
      </span>
    );
  }

  if (current === "BORROWED") {
    return (
      <span className={`${classes} cursor-default border-primary bg-secondary text-background`}>
        <LuCheck className="size-4" />
        Borrowed
      </span>
    );
  }

  if (current === "OVERDUE") {
    return (
      <span className={`${classes} cursor-default border-danger bg-danger/10 font-bold text-danger`}>
        <LuTriangleAlert className="size-4" />
        Overdue — return it
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/sign-in"
        className={`${classes} border-primary bg-primary text-background hover:bg-secondary`}
      >
        <LuBookmarkPlus className="size-4" />
        Sign in to borrow
      </Link>
    );
  }

  if (!available) {
    return (
      <span className={`${classes} cursor-not-allowed border-accent bg-accent/30 text-muted/70`}>
        Unavailable
      </span>
    );
  }

  if (limitReached) {
    return (
      <span
        title={`You can hold at most ${BORROW_LIMIT} books at a time.`}
        className={`${classes} cursor-not-allowed border-accent bg-accent/30 text-muted/70`}
      >
        Borrow limit reached
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBorrow}
      disabled={isPending}
      className={`${classes} ${
        isPending
          ? "cursor-progress border-primary bg-primary/70 text-background"
          : "border-primary bg-primary text-background hover:bg-secondary"
      }`}
    >
      {isPending ? (
        <>
          <LuLoaderCircle className="size-4 animate-spin" />
          Borrowing…
        </>
      ) : (
        <>
          <LuBookmarkPlus className="size-4" />
          {label}
        </>
      )}
    </button>
  );
};

export default BorrowButton;

import Image from "next/image";
import Link from "next/link";
import { canOptimizeImage } from "@/lib/images";
import type { ReactNode } from "react";
import {
  LuBookOpen,
  LuCalendarDays,
  LuCircleCheck,
  LuCircleSlash,
  LuClock,
  LuTriangleAlert,
} from "react-icons/lu";
import LocalTimestamp from "@/components/ui/LocalTimestamp";
import { formatCalendarDate } from "@/lib/date";
import { getPickupDeadline } from "@/lib/receipts";
import type { ReceiptWithBook } from "@/types/receipt";
import type { BorrowStatus } from "@/types/ticket";

const STATUS_VIEW: Record<
  BorrowStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  PENDING: {
    label: "Pending",
    className: "border-accent-deep bg-accent text-primary",
    icon: <LuClock className="size-3.5" />,
  },
  BORROWED: {
    label: "Borrowed",
    className: "border-primary bg-primary text-background",
    icon: <LuBookOpen className="size-3.5" />,
  },
  RETURNED: {
    label: "Returned",
    className: "border-emerald-600 bg-emerald-100 text-emerald-800",
    icon: <LuCircleCheck className="size-3.5" />,
  },
  OVERDUE: {
    label: "Overdue",
    className: "border-danger bg-danger/10 text-danger",
    icon: <LuTriangleAlert className="size-3.5" />,
  },
  EXPIRED: {
    label: "Expired",
    className: "border-secondary bg-secondary/10 text-secondary",
    icon: <LuCircleSlash className="size-3.5" />,
  },
};


const Meta = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "danger" | "strong";
}) => (
  <div className="min-w-0">
    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
      {label}
    </dt>
    <dd
      className={`text-sm ${
        tone === "danger"
          ? "font-bold text-danger"
          : tone === "strong"
            ? "font-bold text-primary"
            : "text-primary"
      }`}
    >
      {value}
    </dd>
  </div>
);

const ReceiptCard = ({ receipt }: { receipt: ReceiptWithBook }) => {
  const status = STATUS_VIEW[receipt.status];
  const overdue = receipt.status === "OVERDUE";
  const awaitingPickup =
    receipt.status === "PENDING" || receipt.status === "EXPIRED";
  const pickupDeadline = getPickupDeadline(receipt.createdAt);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-accent bg-surface p-4 shadow-soft transition duration-300 hover:shadow-lift sm:flex-row sm:gap-5 sm:p-5">
      <Link
        href={`/books/${receipt.book.id}`}
        aria-label={`Open ${receipt.book.title}`}
        className="relative mx-auto aspect-2/3 w-24 shrink-0 overflow-hidden rounded-lg bg-accent/40 shadow-md ring-1 ring-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary sm:mx-0 sm:w-28"
      >
        {receipt.book.coverUrl ? (
          <Image
            src={receipt.book.coverUrl}
            alt={`Cover of ${receipt.book.title}`}
            fill
            unoptimized={!canOptimizeImage(receipt.book.coverUrl)}
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-secondary">
            <LuBookOpen className="size-7" />
            <span className="line-clamp-4 text-xs">{receipt.book.title}</span>
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Header: mã phiếu + trạng thái */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
              Receipt #{receipt.id.slice(0, 8)}
            </p>
            <h3 className="mt-0.5 break-words text-lg font-bold leading-snug text-primary">
              <Link
                href={`/books/${receipt.book.id}`}
                className="underline-offset-4 hover:text-secondary hover:underline"
              >
                {receipt.book.title}
              </Link>
            </h3>
            <p className="mt-0.5 text-sm text-secondary">
              {receipt.book.authorName}
              {receipt.book.publishYear ? ` · ${receipt.book.publishYear}` : ""}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>

        <span className="w-fit rounded-full border border-accent bg-background px-2.5 py-0.5 text-xs uppercase tracking-wider text-secondary">
          {receipt.book.genre}
        </span>

        {receipt.book.summary && (
          <p className="line-clamp-2 text-sm leading-snug text-muted">
            {receipt.book.summary}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-accent/70 pt-3 sm:grid-cols-3">
          <Meta
            label="Requested"
            value={<LocalTimestamp value={receipt.createdAt} withTime />}
            tone="strong"
          />

          {awaitingPickup && (
            <Meta
              label="Pick up by"
              value={<LocalTimestamp value={pickupDeadline} />}
            />
          )}

          {receipt.borrowDate && (
            <Meta
              label="Borrowed on"
              value={<LocalTimestamp value={receipt.borrowDate} />}
            />
          )}

          {receipt.dueDate && (
            <Meta
              label="Due"
              value={formatCalendarDate(receipt.dueDate)}
              tone={overdue ? "danger" : "default"}
            />
          )}

          {receipt.returnDate && (
            <Meta label="Returned on" value={formatCalendarDate(receipt.returnDate)} />
          )}
        </dl>

        {overdue && (
          <p className="flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
            <LuTriangleAlert className="size-3.5 shrink-0" />
            Past the due date — please return this book to the library.
          </p>
        )}

        {receipt.status === "PENDING" && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <LuCalendarDays className="size-3.5 shrink-0" />
            Waiting for the librarian to hand this book over.
          </p>
        )}

        {receipt.status === "EXPIRED" && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <LuCircleSlash className="size-3.5 shrink-0" />
            The 2-day pickup window passed, so this receipt was cancelled.
          </p>
        )}
      </div>
    </article>
  );
};

export default ReceiptCard;

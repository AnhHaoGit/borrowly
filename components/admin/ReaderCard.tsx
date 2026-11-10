"use client";

import {
  LuBookOpen,
  LuCalendarDays,
  LuCircleCheck,
  LuLoader,
  LuShield,
  LuUser,
} from "react-icons/lu";
import { formatCalendarDate, formatTimestamp } from "@/lib/date";
import type { ReaderWithStats, Role } from "@/types/reader";

interface Props {
  reader: ReaderWithStats;
  isSelf: boolean;
  pending: boolean;
  onChangeRole: (reader: ReaderWithStats, role: Role) => void;
}

const ROLE_OPTIONS: { value: Role; label: string; icon: typeof LuUser }[] = [
  { value: "USER", label: "Reader", icon: LuUser },
  { value: "ADMIN", label: "Admin", icon: LuShield },
];

const initials = (fullName: string) =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "?";

const Meta = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5">
    {icon}
    {children}
  </span>
);

const ReaderCard = ({ reader, isSelf, pending, onChangeRole }: Props) => {
  const isAdmin = reader.role === "ADMIN";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-accent bg-surface p-4 shadow-soft transition hover:shadow-lift sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <span
        aria-hidden="true"
        className={`grid size-14 shrink-0 place-items-center rounded-full border-2 text-lg font-bold ${
          isAdmin
            ? "border-primary bg-primary text-background"
            : "border-accent-deep bg-accent text-primary"
        }`}
      >
        {initials(reader.fullName)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-bold leading-tight text-primary">
            {reader.fullName}
          </h3>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
              isAdmin
                ? "border-primary bg-primary text-background"
                : "border-accent-deep bg-accent text-secondary"
            }`}
          >
            {isAdmin ? <LuShield className="size-3" /> : <LuUser className="size-3" />}
            {isAdmin ? "Admin" : "Reader"}
          </span>

          {isSelf && (
            <span className="rounded-full border border-accent-deep/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted">
              You
            </span>
          )}
        </div>

        <p className="truncate text-sm text-secondary">{reader.email}</p>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
          <Meta icon={<LuBookOpen className="size-3.5 shrink-0" />}>
            {reader.activeReceipts}{" "}
            {reader.activeReceipts === 1 ? "book on loan" : "books on loan"}
          </Meta>
          <Meta icon={<LuCircleCheck className="size-3.5 shrink-0" />}>
            {reader.totalReceipts}{" "}
            {reader.totalReceipts === 1 ? "receipt" : "receipts"}
          </Meta>
          <Meta icon={<LuCalendarDays className="size-3.5 shrink-0" />}>
            Joined {formatTimestamp(reader.createdAt)}
          </Meta>
          <Meta icon={<LuCalendarDays className="size-3.5 shrink-0" />}>
            Last active{" "}
            {reader.lastActivityDate
              ? formatCalendarDate(reader.lastActivityDate)
              : "—"}
          </Meta>
        </div>
      </div>

      <div className="shrink-0 sm:w-56">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
          Access level
        </p>

        <div
          role="radiogroup"
          aria-label={`Role for ${reader.fullName}`}
          className="grid grid-cols-2 gap-1 rounded-xl border border-accent bg-background p-1"
        >
          {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = reader.role === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={isSelf || pending}
                onClick={() => onChangeRole(reader, value)}
                className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-sm transition disabled:cursor-not-allowed ${
                  active
                    ? "bg-accent font-bold text-primary shadow-sm"
                    : "text-secondary hover:bg-accent/40 disabled:hover:bg-transparent"
                }`}
              >
                {pending && !active ? (
                  <LuLoader className="size-4 animate-spin" />
                ) : (
                  <Icon className="size-4" />
                )}
                {label}
              </button>
            );
          })}
        </div>

        <p className="mt-1.5 text-[11px] leading-snug text-muted">
          {isSelf
            ? "You can't change your own role."
            : isAdmin
              ? "Admins can manage books and tickets."
              : "Readers can borrow and review books."}
        </p>
      </div>
    </article>
  );
};

export default ReaderCard;

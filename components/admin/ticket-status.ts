import type { BorrowStatus } from "@/types/ticket";

// Thứ tự hiển thị: việc cần xử lý trước.
export const STATUS_ORDER: BorrowStatus[] = [
  "PENDING",
  "BORROWED",
  "OVERDUE",
  "RETURNED",
  "EXPIRED",
];

export const STATUS_VIEW: Record<
  BorrowStatus,
  { label: string; badge: string; dot: string; hint: string }
> = {
  PENDING: {
    label: "Pending",
    badge: "border-amber-300 bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    hint: "Waiting for pickup",
  },
  BORROWED: {
    label: "Borrowed",
    badge: "border-sky-300 bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
    hint: "With the reader",
  },
  OVERDUE: {
    label: "Overdue",
    badge: "border-danger bg-danger/10 text-danger",
    dot: "bg-danger",
    hint: "Past the due date",
  },
  RETURNED: {
    label: "Returned",
    badge: "border-emerald-600 bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-600",
    hint: "Back in the library",
  },
  EXPIRED: {
    label: "Expired",
    badge: "border-secondary bg-secondary/10 text-secondary",
    dot: "bg-secondary",
    hint: "Pickup window passed",
  },
};

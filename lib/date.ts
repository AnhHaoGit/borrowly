const NullDate = "--/--/----";
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseCalendarDate = (value: string | null) => {
  if (!value) return null;

  const match = DATE_RE.exec(value);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  return { year, month, day };
};

//format: MM/DD/YYYY
const DateFormater = Intl.DateTimeFormat("en-US");

export function formatDate(date: Date | string): string{
    if (typeof date == "string"){
        const parsed = parseCalendarDate(date);
        if (!parsed)
            return NullDate;
        return `${parsed.month}/${parsed.day}/${parsed.year}`;
    }
    else
        return DateFormater.format(date);
}

// Cột `date` của Postgres trả về "YYYY-MM-DD": đọc theo UTC để không bị lệch
// một ngày khi máy chủ chạy ở múi giờ khác. VD: "Nov 9, 2026".
export const formatCalendarDate = (value: string | null): string => {
  if (!value) return "—";

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return "—";

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

// Dấu thời gian (timestamp) hiển thị theo múi giờ người đọc. VD: "Nov 9, 2026".
export const formatTimestamp = (
  value: Date | string,
  withTime = false,
): string => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

// Số ngày còn lại tới một cột `date` ("YYYY-MM-DD"): âm nghĩa là đã quá hạn.
export const daysUntil = (value: string | null): number | null => {
  if (!value) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const target = Date.UTC(year, month - 1, day);

  return Math.round((target - today) / (24 * 60 * 60 * 1000));
};

const NullDate = "--/--/----";
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Múi giờ của thư viện. Mọi mốc "hôm nay" (hạn trả, hạn đến nhận, ngày hoạt
// động) và mọi chữ thời gian render ở server đều tính theo múi giờ này, không
// theo múi giờ của máy chủ — Neon và Vercel chạy UTC, lệch 7 tiếng so với người
// dùng ở Việt Nam.
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

export const parseCalendarDate = (value: string | null) => {
  if (!value) return null;

  const match = DATE_RE.exec(value);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  return { year, month, day };
};

// Ngày hôm nay ở múi giờ của thư viện, dạng "YYYY-MM-DD". Dùng để so sánh với
// các cột `date` của Postgres mà không phụ thuộc `Date` của máy đang chạy.
export const todayInAppTimeZone = (now: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
};

//format: MM/DD/YYYY
const DateFormater = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
});

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

/**
 * Dấu thời gian (timestamp) hiển thị theo múi giờ truyền vào — mặc định là múi
 * giờ của thư viện, nên HTML render ở server luôn giống nhau dù máy chủ đặt ở
 * đâu. Client nâng cấp thành múi giờ của người đọc qua <LocalTimestamp />.
 */
export const formatTimestamp = (
  value: Date | string,
  withTime = false,
  timeZone: string = APP_TIME_ZONE,
): string => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone,
  });
};

// Số ngày còn lại tới một cột `date` ("YYYY-MM-DD"): âm nghĩa là đã quá hạn.
// "Hôm nay" lấy theo múi giờ của thư viện để không lệch một ngày vào lúc rạng
// sáng khi máy chủ chạy UTC.
export const daysUntil = (value: string | null): number | null => {
  if (!value) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  const [todayYear, todayMonth, todayDay] = todayInAppTimeZone()
    .split("-")
    .map(Number) as [number, number, number];

  const today = Date.UTC(todayYear, todayMonth - 1, todayDay);
  const target = Date.UTC(year, month - 1, day);

  return Math.round((target - today) / (24 * 60 * 60 * 1000));
};

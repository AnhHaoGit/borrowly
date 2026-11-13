"use client";

import { useSyncExternalStore } from "react";
import { APP_TIME_ZONE, formatTimestamp } from "@/lib/date";

interface Props {
  value: Date | string;
  withTime?: boolean;
}

// Múi giờ của trình duyệt không đổi trong lúc trang mở, nên chỉ cần một
// subscription rỗng: React đọc lại snapshot khi hydrate xong.
const subscribe = () => () => {};

const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Trong lúc render ở server (và lần hydrate đầu tiên) dùng múi giờ của thư
// viện, nên HTML và client khớp nhau; sau đó chữ được tính lại theo người đọc.
const getServerTimeZone = () => APP_TIME_ZONE;

/**
 * Hiển thị một mốc thời gian theo múi giờ của người đọc, không theo múi giờ
 * của máy chủ (Neon/Vercel chạy UTC).
 */
const LocalTimestamp = ({ value, withTime = false }: Props) => {
  const timeZone = useSyncExternalStore(
    subscribe,
    getBrowserTimeZone,
    getServerTimeZone,
  );

  return (
    <span suppressHydrationWarning>
      {formatTimestamp(value, withTime, timeZone)}
    </span>
  );
};

export default LocalTimestamp;

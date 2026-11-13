"use client";

import { useEffect, useState } from "react";

/**
 * Trả về giá trị chỉ cập nhật sau `delay` ms kể từ lần thay đổi cuối.
 *
 * Dùng cho ô tìm kiếm: gõ liên tục thì không bắn một request cho mỗi ký tự,
 * chỉ tìm sau khi người dùng ngừng gõ một nhịp.
 */
export const useDebouncedValue = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

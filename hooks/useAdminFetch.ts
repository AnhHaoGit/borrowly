"use client";

import { useEffect, useState } from "react";

interface Result<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Tải một danh sách admin từ API route. Dùng AbortController để bỏ qua kết quả
 * của request cũ, và trả kèm `reload` cho nút thử lại.
 */
export const useAdminFetch = <T>(url: string, label: string): Result<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    // Trì hoãn sang microtask để không set state đồng bộ trong effect.
    Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;

      setLoading(true);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as T;

        if (controller.signal.aborted) return;

        setData(payload);
        setError(null);
      } catch {
        if (controller.signal.aborted) return;

        setError(`Failed to load ${label}. Please try again.`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    });

    return () => controller.abort();
  }, [url, label, reloadKey]);

  return {
    data,
    loading,
    error,
    reload: () => setReloadKey((key) => key + 1),
  };
};

// Những host đã khai báo trong `images.remotePatterns` của next.config.ts thì
// để Next tối ưu ảnh. Host khác (ảnh dán từ nơi khác, dữ liệu cũ) vẫn hiển thị
// được, chỉ là render trực tiếp — thà mất tối ưu còn hơn vỡ cả trang.
const OPTIMIZED_IMAGE_HOSTS = new Set([
  "covers.openlibrary.org",
  "res.cloudinary.com",
]);

export const canOptimizeImage = (src: string): boolean => {
  try {
    const url = new URL(src);

    if (url.protocol !== "https:" && url.protocol !== "http:") return false;

    return OPTIMIZED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

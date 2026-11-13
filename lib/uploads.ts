import { createHash } from "node:crypto";

// Ảnh bìa và ảnh tác giả đều là ảnh thường; 5 MB là quá đủ cho một tấm bìa và
// vẫn nằm dưới giới hạn body của route handler trên các nền tảng serverless.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const UPLOAD_FOLDER = "borrowly/books";

export const isImageUploadConfigured = (): boolean =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; code: "NOT_CONFIGURED" | "INVALID" | "FAILED"; message: string };

// Cloudinary ký bằng sha1 của các tham số đã sắp xếp (trừ file, api_key) nối
// với api_secret. Chữ ký do server tạo nên secret không bao giờ ra tới trình
// duyệt.
const signParams = (params: Record<string, string>, secret: string): string =>
  createHash("sha1")
    .update(
      Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&") + secret,
    )
    .digest("hex");

export const uploadBookImage = async (file: File): Promise<UploadImageResult> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message:
        "Image uploads aren't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the environment.",
    };
  }

  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      code: "INVALID",
      message: "Upload a JPG, PNG, WebP, AVIF or GIF image.",
    };
  }

  if (file.size === 0) {
    return { ok: false, code: "INVALID", message: "That file is empty." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      code: "INVALID",
      message: `Images must be smaller than ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { folder: UPLOAD_FOLDER, timestamp };

  const body = new FormData();
  body.append("file", file, file.name || "upload");
  body.append("api_key", apiKey);
  body.append("folder", UPLOAD_FOLDER);
  body.append("timestamp", timestamp);
  body.append("signature", signParams(params, apiSecret));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body },
    );

    const payload = (await response.json().catch(() => null)) as
      | { secure_url?: string; error?: { message?: string } }
      | null;

    if (!response.ok || !payload?.secure_url) {
      console.error("Cloudinary upload failed:", response.status, payload);

      // 403 ở đây gần như luôn là API key bị giới hạn quyền, không phải lỗi
      // mạng: nói rõ để admin biết phải sửa gì trong Cloudinary.
      const permissionHint =
        response.status === 403
          ? " Your Cloudinary API key doesn't have permission to create assets — use a key with the upload permission (Cloudinary Console → Settings → API Keys)."
          : "";

      return {
        ok: false,
        code: "FAILED",
        message: `${payload?.error?.message ?? "The image couldn't be uploaded."}${permissionHint}`,
      };
    }

    return { ok: true, url: payload.secure_url };
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return {
      ok: false,
      code: "FAILED",
      message: "The image couldn't be uploaded. Please try again.",
    };
  }
};

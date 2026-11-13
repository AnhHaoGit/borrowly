import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import {
  isImageUploadConfigured,
  uploadBookImage,
  type UploadImageResult,
} from "@/lib/uploads";

const failure = (
  result: Extract<UploadImageResult, { ok: false }>,
  status: number,
) => NextResponse.json({ message: result.message }, { status });

export async function POST(request: Request) {
  // Quyền kiểm tra ở server: chỉ admin mới được đẩy ảnh lên cloud.
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json(
      { message: "You don't have permission to do that." },
      { status: 403 },
    );
  }

  // Chặn form post từ site khác lợi dụng cookie của admin.
  const origin = request.headers.get("origin");

  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
  }

  if (!isImageUploadConfigured()) {
    return failure(
      {
        ok: false,
        code: "NOT_CONFIGURED",
        message:
          "Image uploads aren't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the environment.",
      },
      503,
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Choose an image to upload." },
      { status: 400 },
    );
  }

  const result = await uploadBookImage(file);

  if (!result.ok) {
    return failure(result, result.code === "INVALID" ? 400 : 502);
  }

  return NextResponse.json(
    { url: result.url },
    { headers: { "Cache-Control": "no-store" } },
  );
}

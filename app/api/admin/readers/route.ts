import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getReadersWithStats } from "@/database/users";

// Danh sách người dùng chỉ dành cho admin: kiểm tra quyền ngay ở server.
export async function GET() {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const readers = await getReadersWithStats();

    return NextResponse.json(
      { readers },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to fetch readers:", error);

    return NextResponse.json(
      { message: "Failed to fetch readers" },
      { status: 500 },
    );
  }
}

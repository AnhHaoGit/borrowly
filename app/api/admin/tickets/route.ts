import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import {
  getAllReceiptsWithDetails,
  sweepReceiptStatuses,
} from "@/database/receipts";

// Toàn bộ phiếu mượn, chỉ dành cho admin. Đồng bộ trạng thái phụ thuộc thời gian
// trước khi đọc để PENDING quá 2 ngày và BORROWED quá hạn hiện đúng.
export async function GET() {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await sweepReceiptStatuses();

    const tickets = await getAllReceiptsWithDetails();

    return NextResponse.json(
      { tickets },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to fetch tickets:", error);

    return NextResponse.json(
      { message: "Failed to fetch tickets" },
      { status: 500 },
    );
  }
}

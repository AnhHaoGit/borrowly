"use server";

import { auth } from "@/auth";
import { borrowBookForUser } from "@/database/receipts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BorrowResult =
  | { success: true; receiptId: string; pickupDeadline: string }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "NOT_FOUND"
        | "OUT_OF_STOCK"
        | "LIMIT_REACHED"
        | "ALREADY_BORROWED"
        | "FAILED";
      message: string;
    };

/**
 * Tạo phiếu mượn cho người đang đăng nhập.
 *
 * Id người dùng luôn lấy từ session ở server, không bao giờ nhận từ client.
 * Mọi kiểm tra nghiệp vụ (đăng nhập, tồn kho, giới hạn 10 cuốn, mượn trùng)
 * đều nằm ở server nên gọi thẳng action cũng không vượt được.
 */
export const borrowBook = async (bookId: string): Promise<BorrowResult> => {
  if (typeof bookId !== "string" || !UUID_RE.test(bookId)) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "This book is no longer in the library.",
    };
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      code: "UNAUTHENTICATED",
      message: "Please sign in to borrow books.",
    };
  }

  const outcome = await borrowBookForUser({ userId, bookId });

  if (!outcome.ok) {
    return { success: false, code: outcome.code, message: outcome.message };
  }

  return {
    success: true,
    receiptId: outcome.receiptId,
    pickupDeadline: outcome.pickupDeadline.toISOString(),
  };
};

import { NextResponse } from "next/server";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import {
  deleteReview,
  getReviewState,
  refreshBookRating,
  saveReview,
} from "@/database/reviews";
import { MAX_COMMENT_LENGTH, MAX_RATING, MIN_RATING } from "@/types/review";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

const resolveBookId = async ({ params }: RouteContext) => {
  const { id } = await params;

  if (!UUID_RE.test(id)) return null;

  const [book] = await db
    .select({ id: books.id })
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  return book?.id ?? null;
};

export async function GET(_request: Request, context: RouteContext) {
  // Đọc cookie phiên nên route phải render theo từng request.
  await connection();

  const bookId = await resolveBookId(context);

  if (!bookId) return json({ message: "Book not found" }, 404);

  const session = await auth();
  const state = await getReviewState(bookId, session?.user?.id);

  return json(state);
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return json({ message: "Sign in to rate this book" }, 401);

  const bookId = await resolveBookId(context);

  if (!bookId) return json({ message: "Book not found" }, 404);

  const body = (await request.json().catch(() => null)) as {
    rating?: unknown;
    comment?: unknown;
  } | null;

  const rating = Number(body?.rating);

  if (
    !Number.isInteger(rating) ||
    rating < MIN_RATING ||
    rating > MAX_RATING
  ) {
    return json(
      { message: "Rating must be between half a star and five stars" },
      400,
    );
  }

  const rawComment =
    typeof body?.comment === "string" ? body.comment.trim() : "";
  const comment = rawComment.length > 0 ? rawComment : null;

  if (comment && comment.length > MAX_COMMENT_LENGTH) {
    return json(
      { message: `Comment must be at most ${MAX_COMMENT_LENGTH} characters` },
      400,
    );
  }

  await saveReview({ bookId, userId, rating, comment });
  await refreshBookRating(bookId);

  return json(await getReviewState(bookId, userId));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return json({ message: "Sign in to manage your review" }, 401);

  const bookId = await resolveBookId(context);

  if (!bookId) return json({ message: "Book not found" }, 404);

  const removed = await deleteReview(bookId, userId);

  if (!removed) return json({ message: "You have not reviewed this book" }, 404);

  await refreshBookRating(bookId);

  return json(await getReviewState(bookId, userId));
}

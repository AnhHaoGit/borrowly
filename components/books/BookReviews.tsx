"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { LuLoader, LuTrash2 } from "react-icons/lu";
import LocalTimestamp from "@/components/ui/LocalTimestamp";
import { StarRating, StarRatingInput } from "@/components/ui/StarRating";
import { notify } from "@/lib/toast";
import {
  MAX_COMMENT_LENGTH,
  toStars,
  type ReviewState,
} from "@/types/review";

interface Props {
  bookId: string;
  initial: ReviewState;
  viewerId: string | null;
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

const BookReviews = ({ bookId, initial, viewerId }: Props) => {
  const [state, setState] = useState<ReviewState>(initial);
  const [rating, setRating] = useState(initial.viewer?.rating ?? 0);
  const [comment, setComment] = useState(initial.viewer?.comment ?? "");
  const [pending, setPending] = useState(false);
  const commentId = useId();

  const { reviews, average, count, viewer } = state;

  const send = async (method: "PUT" | "DELETE", body?: unknown) => {
    const response = await fetch(`/api/books/${bookId}/reviews`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message ?? "Something went wrong");
    }

    return payload as ReviewState;
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating < 1) {
      notify.error("Pick a rating first");
      return;
    }

    const wasReviewing = Boolean(viewer);

    setPending(true);

    try {
      setState(await send("PUT", { rating, comment }));
      notify.success(
        wasReviewing ? "Your review was updated" : "Thanks for the review",
        { description: wasReviewing ? undefined : "Your rating is now public" },
      );
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to save your review",
      );
    } finally {
      setPending(false);
    }
  };

  const removeReview = async () => {
    setPending(true);

    try {
      setState(await send("DELETE"));
      setRating(0);
      setComment("");
      notify.info("Your review was deleted");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to delete your review",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="mt-10 rounded-2xl border border-accent bg-surface p-5 shadow-soft md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2
            id="reviews-heading"
            className="text-2xl font-bold text-primary"
          >
            Reader reviews
          </h2>
          <p className="mt-1 text-sm text-muted">
            {count === 0
              ? "No ratings yet — be the first to share your thoughts."
              : `${count} ${count === 1 ? "reader has" : "readers have"} rated this book.`}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-accent/70 bg-background/60 px-4 py-2.5">
          <span className="text-3xl font-bold leading-none text-primary">
            {average !== null ? average.toFixed(1) : "—"}
          </span>
          <div className="space-y-1">
            <StarRating value={average ?? 0} size="md" />
            <p className="text-[11px] uppercase tracking-wider text-muted">
              {count === 0
                ? "Not rated yet"
                : `${count} ${count === 1 ? "rating" : "ratings"} · out of 5`}
            </p>
          </div>
        </div>
      </div>

      {viewerId === null ? (
        <p className="mt-6 rounded-xl border border-dashed border-accent-deep/60 bg-background/60 px-5 py-4 text-sm text-muted">
          <Link
            href="/sign-in"
            className="font-bold text-secondary underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to rate this book and leave a comment.
        </p>
      ) : (
        <form
          onSubmit={submitReview}
          className="mt-6 space-y-4 rounded-xl border border-accent bg-background/60 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
                {viewer ? "Your review" : "Rate this book"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                Half stars count too — pick from 0.5 to 5.
              </p>
            </div>

            <StarRatingInput
              value={rating}
              onChange={setRating}
              disabled={pending}
            />
          </div>

          <div>
            <label htmlFor={commentId} className="sr-only">
              Your comment
            </label>
            <textarea
              id={commentId}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={pending}
              placeholder="What did you think about this book? (optional)"
              className="w-full resize-y rounded-xl border border-accent bg-surface px-4 py-3 text-sm leading-relaxed text-primary placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-70"
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>

              <div className="flex items-center gap-2">
                {viewer && (
                  <button
                    type="button"
                    onClick={removeReview}
                    disabled={pending}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-danger/40 px-4 text-sm text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LuTrash2 className="size-4" />
                    Delete
                  </button>
                )}

                <button
                  type="submit"
                  disabled={pending || rating < 1}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-primary bg-primary px-5 text-sm text-background transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending && <LuLoader className="size-4 animate-spin" />}
                  {viewer ? "Save changes" : "Post review"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-accent-deep/60 bg-background/60 px-5 py-8 text-center text-sm text-muted">
          No reviews yet — your rating can be the first.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((review) => {
            const isOwn = review.userId === viewerId;
            const stars = toStars(review.rating);

            return (
              <li
                key={review.id}
                className="rounded-xl border border-accent/70 bg-background/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-primary">
                      {initials(review.userName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-primary">
                        {review.userName}
                        {isOwn && (
                          <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        <LocalTimestamp value={review.updatedAt} />
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <StarRating value={stars} size="sm" />
                    <span className="text-xs font-bold text-secondary">
                      {stars.toFixed(1)}
                    </span>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-3 whitespace-pre-line wrap-break-word text-sm leading-relaxed text-primary/85">
                    {review.comment}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default BookReviews;

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuBookOpen, LuReceipt } from "react-icons/lu";
import { auth } from "@/auth";
import ProfileCard from "@/components/profile/ProfileCard";
import ReceiptCard from "@/components/profile/ReceiptCard";
import { getReceiptsByUserId, sweepReceiptStatuses } from "@/database/receipts";
import { getUserProfile } from "@/database/users";
import { groupReceipts } from "@/lib/receipts";

export const metadata: Metadata = { title: "Profile" };

// Trang đọc phiên đăng nhập + dữ liệu riêng của người dùng nên không thể prerender.
export const instant = false;

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  // Phiếu quá 2 ngày không nhận / quá hạn trả phải hiện đúng trạng thái ngay khi
  // mở trang, không cần admin thao tác.
  await sweepReceiptStatuses();

  const [user, receipts] = await Promise.all([
    getUserProfile(userId),
    getReceiptsByUserId(userId),
  ]);

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[50vh] w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-primary">
          We couldn&apos;t find your profile
        </h1>
        <p className="max-w-md text-sm text-muted">
          Your session is still valid but this account no longer exists. Please
          sign in again.
        </p>
        <Link
          href="/sign-in"
          className="rounded-full border border-primary bg-primary px-6 py-2.5 text-sm text-background transition hover:bg-secondary"
        >
          Sign in
        </Link>
      </section>
    );
  }

  // Tách phiếu theo việc còn phải làm: nhận sách, trả sách, hay đã xong.
  // Trong mỗi nhóm, phiếu cận hạn nhất đứng đầu.
  const groups = groupReceipts(receipts);
  const sections = [
    {
      key: "pickup",
      title: "Waiting for pickup",
      hint: "Pick these up within 2 days or the receipt expires.",
      items: groups.pickup,
    },
    {
      key: "shelf",
      title: "On loan",
      hint: "Sorted by due date — soonest first.",
      items: groups.shelf,
    },
    {
      key: "history",
      title: "Closed receipts",
      hint: "Returned or cancelled, newest first.",
      items: groups.history,
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight text-primary md:text-4xl">
          Your profile
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Your account details and every borrowing receipt you created.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <ProfileCard user={user} />

        <section aria-labelledby="receipts-heading" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="receipts-heading"
                className="text-2xl font-bold text-primary"
              >
                Receipts
              </h2>
              <p className="mt-1 text-sm text-muted">
                {receipts.length === 0
                  ? "Nothing borrowed yet."
                  : `${receipts.length} ${receipts.length === 1 ? "receipt" : "receipts"} · soonest deadline first`}
              </p>
            </div>

            <Link
              href="/books"
              className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
            >
              Browse books
            </Link>
          </div>

          {receipts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-accent-deep/70 bg-surface/60 px-6 py-14 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-accent text-primary">
                <LuReceipt className="size-6" />
              </span>
              <p className="text-lg font-bold text-primary">No receipts yet</p>
              <p className="max-w-sm text-sm text-muted">
                When you borrow a book, its receipt appears here with the pickup
                deadline, due date and status.
              </p>
              <Link
                href="/books"
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-5 py-2.5 text-sm text-background transition hover:bg-secondary"
              >
                <LuBookOpen className="size-4" />
                Find a book
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => (
                <section
                  key={section.key}
                  aria-labelledby={`receipts-${section.key}`}
                >
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3
                      id={`receipts-${section.key}`}
                      className="flex items-center gap-2 text-lg font-bold text-primary"
                    >
                      {section.title}
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-secondary">
                        {section.items.length}
                      </span>
                    </h3>
                    <p className="text-xs text-muted">{section.hint}</p>
                  </div>

                  <ul className="space-y-4">
                    {section.items.map((receipt) => (
                      <li key={receipt.id}>
                        <ReceiptCard receipt={receipt} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-primary">
        Something went wrong loading your profile
      </h1>
      <p className="max-w-md text-sm text-muted">
        We couldn&apos;t load your account details and receipts. Try again in a
        moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-primary bg-primary px-6 py-2.5 text-sm text-background transition hover:bg-secondary"
      >
        Try again
      </button>
    </main>
  );
}

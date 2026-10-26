"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#fbf7e8] flex flex-col items-center justify-center gap-4">
      <p className="text-gray-700">Something went wrong loading your profile.</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded bg-indigo-600 text-white"
      >
        Try again
      </button>
    </main>
  );
}
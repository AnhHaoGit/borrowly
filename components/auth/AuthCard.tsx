import type { ReactNode } from "react";
import AuthIllustration from "./AuthIllustration";

const AuthCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid overflow-hidden rounded-3xl border-2 border-accent bg-surface shadow-lift lg:grid-cols-2">
      <aside
        aria-hidden="true"
        className="relative h-32 sm:h-44 md:h-56 lg:h-auto lg:min-h-[680px]"
      >
        <AuthIllustration className="absolute inset-0 size-full" />

        <div className="absolute inset-x-8 bottom-8 hidden rounded-2xl bg-surface/85 p-6 shadow-soft backdrop-blur lg:block">
          <p className="text-2xl font-bold leading-snug text-primary">
            Your next favourite story is one borrow away.
          </p>
          <p className="mt-2 text-muted">Reserve your books in a few taps.</p>
        </div>
      </aside>

      <div className="flex items-center px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <div className="mx-auto w-full max-w-md space-y-9">{children}</div>
      </div>
    </div>
  );
};

export default AuthCard;

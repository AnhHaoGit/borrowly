import type { ReactNode } from "react";
import { LuLoader } from "react-icons/lu";

interface Props {
  pending: boolean;
  pendingText: string;
  children: ReactNode;
}

const SubmitButton = ({ pending, pendingText, children }: Props) => {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-accent-deep bg-accent text-lg font-bold text-primary shadow-soft transition hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <LuLoader className="size-5 animate-spin" aria-hidden="true" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;

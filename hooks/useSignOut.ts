import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { notify } from "@/lib/toast";

export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOutUser = useCallback(async () => {
    if (pending) return;
    setPending(true);

    try {
      await signOut({ redirect: false });
      router.push("/sign-in");
      router.refresh();
    } catch {
      notify.error("Couldn’t sign you out. Please try again.");
    } finally {
      setPending(false);
    }
  }, [pending, router]);

  return { signOutUser, pending };
}

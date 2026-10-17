import type { Metadata } from "next";
import AuthHeader from "@/components/auth/AuthHeader";
import SignInForm from "@/components/auth/SignInForm";
import { signInWithCredentials } from "@/lib/auth";


export const metadata: Metadata = { title: "Log in" };

const SignInPage = () => {
  return (
    <>
      <AuthHeader
        title="Welcome to Borrowly"
        description="Discover a seamless way to borrow your books and unlock exclusive benefits. Log in to pick up where you left off."
      />
      <SignInForm action={signInWithCredentials} />
    </>
  );
};

export default SignInPage;

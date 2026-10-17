import type { Metadata } from "next";
import AuthHeader from "@/components/auth/AuthHeader";
import SignUpForm from "@/components/auth/SignUpForm";
import { signUp } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

const SignUpPage = () => {
  return (
    <>
      <AuthHeader
        title="Join Borrowly"
        description="Create a free account to reserve books, track what you have borrowed and never miss a due date."
      />
      <SignUpForm action={signUp} />
    </>
  );
};

export default SignUpPage;

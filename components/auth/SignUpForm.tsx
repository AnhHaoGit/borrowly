"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  PASSWORD_MIN_LENGTH,
  validateSignUp,
  type FieldErrors,
  type SignUpValues,
} from "@/lib/auth/validation";
import { focusField } from "./focusField";
import PasswordField from "./PasswordField";
import SubmitButton from "./SubmitButton";
import TextField from "./TextField";
import { useRouter } from "next/navigation";
import type { AuthCredentials } from "@/types/user";
import { notify } from "@/lib/toast";
import { useSession } from "next-auth/react";

interface Props {
  action?: (
    data: AuthCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
}

const INITIAL_VALUES: SignUpValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SignUpForm = ({ action }: Props) => {
  const [values, setValues] = useState<SignUpValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<SignUpValues>>({});
  const [pending, setPending] = useState(false);
  const { update: refreshSession } = useSession();

  const router = useRouter();

  // Gõ lại vào ô nào thì xoá lỗi của ô đó
  const handleChange =
    (field: keyof SignUpValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;

    const nextErrors = validateSignUp(values);
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      focusField(form, firstInvalid);
      return;
    }

    setPending(true);
    try {
      const result = await action?.({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      if (!result) return;

      if (!result.success) {
        notify.error(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      await refreshSession();
      notify.success("Account created. Welcome to Borrowly!");
      router.push("/books");
      setValues(INITIAL_VALUES);
      router.refresh();
    } catch {
      notify.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-7">
      <h2 className="text-3xl font-bold text-primary">Create account</h2>

      <TextField
        label="Full name"
        name="fullName"
        autoComplete="name"
        value={values.fullName}
        onChange={handleChange("fullName")}
        error={errors.fullName}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange("email")}
        error={errors.email}
      />

      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
      />

      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={errors.confirmPassword}
      />

      <SubmitButton pending={pending} pendingText="Creating account…">
        Create account
      </SubmitButton>

      <p className="text-center text-base text-primary">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-bold text-secondary underline underline-offset-4 transition hover:text-primary"
        >
          Log in
        </Link>
      </p>
    </form>
  );
};

export default SignUpForm;

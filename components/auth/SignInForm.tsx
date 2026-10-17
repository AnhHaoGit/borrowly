"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  validateSignIn,
  type FieldErrors,
  type SignInValues,
} from "@/lib/auth/validation";
import { focusField } from "./focusField";
import PasswordField from "./PasswordField";
import SubmitButton from "./SubmitButton";
import TextField from "./TextField";
import { AuthCredentials } from "@/types/user";
import { useRouter } from "next/navigation";

interface Props {
  action?: (
    data: Omit<AuthCredentials, "fullName">,
  ) => Promise<{ success: boolean; error?: string }>;
}

const INITIAL_VALUES: SignInValues = { email: "", password: "" };

const SignInForm = ({ action }: Props) => {
  const [values, setValues] = useState<SignInValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<SignInValues>>({});
  const [formError, setFormError] = useState<string | null | undefined>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();

  // Gõ lại vào ô nào thì xoá lỗi của ô đó
  const handleChange =
    (field: keyof SignInValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;

    const nextErrors = validateSignIn(values);
    setErrors(nextErrors);
    setFormError(null);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      focusField(form, firstInvalid);
      return;
    }

    setPending(true);
    try {
      const result = await action?.({
        email: values.email.trim(),
        password: values.password,
      });
      if (result?.success) {
        router.push("/");
      } else {
        setFormError(result?.error);
      }    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-7">
      <h2 className="text-3xl font-bold text-primary">Log in</h2>

      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {formError}
        </p>
      )}

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
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
      />

      <SubmitButton pending={pending} pendingText="Logging in…">
        Login
      </SubmitButton>

      <p className="text-center text-base text-primary">
        Need an account?{" "}
        <Link
          href="/sign-up"
          className="font-bold text-secondary underline underline-offset-4 transition hover:text-primary"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};

export default SignInForm;

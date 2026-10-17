export const NAME_MIN_LENGTH = 2;
export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignInValues {
  email: string;
  password: string;
}

export interface SignUpValues extends SignInValues {
  fullName: string;
  confirmPassword: string;
}

/** Mỗi trường có tối đa một thông báo lỗi */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "Please enter your email.";
  if (!EMAIL_PATTERN.test(email.trim()))
    return "Please enter a valid email address.";
  return undefined;
};

export function validateSignIn(
  values: SignInValues,
): FieldErrors<SignInValues> {
  const errors: FieldErrors<SignInValues> = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) errors.password = "Please enter your password.";

  return errors;
}

export function validateSignUp(
  values: SignUpValues,
): FieldErrors<SignUpValues> {
  const errors: FieldErrors<SignUpValues> = {};

  if (values.fullName.trim().length < NAME_MIN_LENGTH) {
    errors.fullName = "Please enter your full name.";
  }

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

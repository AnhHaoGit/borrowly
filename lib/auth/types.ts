export type AuthActionResult =
  | { success: true }
  | { success: false; error: string };

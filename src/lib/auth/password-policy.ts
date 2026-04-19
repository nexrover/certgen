import { z } from "zod";

export const SignupPasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .regex(/[A-Z]/, { message: "Password must include an uppercase letter." })
  .regex(/[0-9]/, { message: "Password must include a number." })
  .regex(/[^A-Za-z0-9]/, { message: "Password must include a symbol." });

export function validateSignupPassword(password: string): string | null {
  const result = SignupPasswordSchema.safeParse(password);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid password.";
}

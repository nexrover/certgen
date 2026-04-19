"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { validateSignupPassword } from "@/lib/auth/password-policy";
import { PasswordInput } from "@/components/ui/password-input";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const code = digits.join("");

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  const onEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Request failed.");
      }
      setMessage("If that email is registered, we sent a 6-digit code (valid 5 minutes).");
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCodeContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setStep("password");
  };

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const pwErr = validateSignupPassword(newPassword);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Could not reset password.");
      }
      router.replace("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Forgot password</h1>
      <p className="mt-1 text-sm text-gray-600">
        {step === "email" && "Enter your email to receive a verification code."}
        {step === "code" && "Enter the 6-digit code from your email."}
        {step === "password" && "Choose a new password."}
      </p>

      {step === "email" ? (
        <form onSubmit={onEmailSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : null}

      {step === "code" ? (
        <form onSubmit={onCodeContinue} className="mt-6 space-y-4">
          <div className="flex justify-center gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                className="h-12 w-10 rounded-md border border-gray-300 text-center text-lg font-semibold outline-none ring-indigo-500 focus:ring-2"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={code.length !== 6}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Continue
          </button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-700">New password</span>
            <PasswordInput
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Confirm password</span>
            <PasswordInput
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <span className="text-xs text-gray-500">
            Min 8 characters, one uppercase, one number, one symbol.
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Reset password & return to Sign in"}
          </button>
        </form>
      ) : null}

      {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <p className="mt-4 text-sm text-gray-600">
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      </p>
    </div>
  );
}

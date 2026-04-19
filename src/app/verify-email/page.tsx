"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);

  const code = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const setAt = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onPaste = (event: React.ClipboardEvent) => {
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      event.preventDefault();
      setDigits(text.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (code.length !== 6 || !email) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Verification failed.");
      }
      router.replace("/login?verified=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Could not resend code.");
      }
      setResendTimer(300);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resend.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 text-center">Verify your email</h1>
      <p className="mt-3 text-sm text-gray-600">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-gray-900">{email || "your email"}</span>. It expires in 5
        minutes.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="flex justify-center gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) {
                  inputsRef.current[i - 1]?.focus();
                }
              }}
              className="h-12 w-10 rounded-md border border-gray-300 text-center text-lg font-semibold outline-none ring-indigo-500 focus:ring-2"
            />
          ))}
        </div>

        <div className="mt-2 text-center text-sm text-gray-500">
          {resendTimer > 0 ? (
            <span>
              Resend code in <span className="font-medium text-gray-900">{Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, "0")}</span>
            </span>
          ) : (
            <button
              type="button"
              disabled={resending || !email}
              onClick={() => void onResend()}
              className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 transition-colors"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || code.length !== 6}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Verifying..." : "Continue to Sign in"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 rounded-md border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
        After verification you can sign in and open your dashboard.
      </div>
    </div>
  );
}

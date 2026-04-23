"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";

type MessageType = "success" | "error";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const nextPath = searchParams.get("next") ?? "/dashboard";
  const loginError = searchParams.get("error");
  const verified = searchParams.get("verified");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = (await res.json()) as { user?: { id: string } | null };
      if (cancelled) return;
      if (data.user) {
        router.replace(nextPath);
      } else {
        setIsCheckingSession(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  useEffect(() => {
    if (verified === "1") {
      setMessage("Email verified successfully. You can sign in now.");
      setMessageType("success");
      return;
    }

    if (loginError === "verify_email_required") {
      setMessage("Please verify your email before signing in.");
      setMessageType("error");
      return;
    }

    if (loginError === "auth_callback_failed") {
      setMessage("Could not complete email confirmation. Please request a new code.");
      setMessageType("error");
      return;
    }

    setMessage(null);
  }, [loginError, verified]);

  const onEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Sign in failed.");
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign in failed.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 text-center">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500 text-center">
        Sign in to continue to your dashboard.
      </p>

      <form onSubmit={onEmailAuth} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          />
        </label>
        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <PasswordInput
            placeholder="Your password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </Link>
        </div>

        <input type="hidden" name="next" value={nextPath} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 text-center">
        New here?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Create an account
        </Link>
      </p>

      {message ? (
        <p
          className={`mt-4 text-sm ${messageType === "success" ? "text-emerald-600" : "text-red-600"
            }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto mt-20 max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

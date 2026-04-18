"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const nextPath = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        router.replace(nextPath);
      } else {
        setIsCheckingSession(false);
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [nextPath, router, supabase]);

  const onEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setMessage(
        "Sign-up successful. Check your email for verification if required, then sign in."
      );
      setMode("signin");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed.";
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOAuth = async (provider: "google" | "facebook") => {
    setMessage(null);
    setIsSubmitting(true);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() },
    });

    if (error) {
      setMessage(error.message);
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
      <h1 className="text-2xl font-semibold text-gray-900">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Sign in with OAuth or your email and password.
      </p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => void onOAuth("google")}
          disabled={isSubmitting}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => void onOAuth("facebook")}
          disabled={isSubmitting}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Continue with Facebook
        </button>
      </div>

      <div className="my-6 h-px bg-gray-200" />

      <form onSubmit={onEmailAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
        <input
          type="password"
          placeholder="Password"
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Sign up"}
        </button>
      </form>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-60"
      >
        {mode === "signin"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>

      {message ? <p className="mt-4 text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}

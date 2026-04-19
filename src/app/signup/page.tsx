"use client";

import Link from "next/link";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateSignupPassword } from "@/lib/auth/password-policy";
import { PasswordInput } from "@/components/ui/password-input";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

export default function SignupPage() {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const skipCaptcha = process.env.NEXT_PUBLIC_SKIP_CAPTCHA === "true";
  const captchaEnabled = !skipCaptcha && !!siteKey;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  /* Render the reCAPTCHA v2 checkbox once the script is ready */
  useEffect(() => {
    if (!captchaEnabled || !scriptLoaded) return;
    if (!captchaRef.current || widgetIdRef.current !== null) return;

    const tryRender = () => {
      if (window.grecaptcha && captchaRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(null),
        });
      }
    };

    if (window.grecaptcha) {
      window.grecaptcha.ready(tryRender);
    }
  }, [captchaEnabled, scriptLoaded, siteKey]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const localPw = validateSignupPassword(password);
    if (localPw) {
      setError(localPw);
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          captchaToken: captchaEnabled ? captchaToken : null,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { email: string };
      };
      if (!res.ok || !data.success) {
        /* Reset the checkbox so user can retry */
        if (captchaEnabled && window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
          setCaptchaToken(null);
        }
        throw new Error(data.error ?? "Could not create your account.");
      }

      const em = data.data?.email ?? email;
      router.push(`/verify-email?email=${encodeURIComponent(em)}`);
    } catch (submissionError) {
      const nextMessage =
        submissionError instanceof Error
          ? submissionError.message
          : "Could not create your account. Please try again.";
      setError(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Load reCAPTCHA v2 script (explicit render mode) */}
      {captchaEnabled ? (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
        />
      ) : null}

      <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Start by setting up your profile and credentials.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">First Name</span>
            <input
              type="text"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Last Name</span>
            <input
              type="text"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            />
          </label>
        </div>

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

        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <PasswordInput
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="text-xs text-gray-500">
            Min 8 characters, one uppercase letter, one number, one symbol.
          </span>
        </div>

        {/* reCAPTCHA v2 checkbox widget */}
        {captchaEnabled ? (
          <div className="flex justify-center">
            <div ref={captchaRef} />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || (captchaEnabled && !captchaToken)}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <p className="mt-4 text-sm text-gray-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] leading-tight text-gray-400">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">
          Terms of Service
        </a>{" "}
        apply.
      </p>
    </div>
  );
}

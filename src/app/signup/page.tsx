"use client";

import Link from "next/link";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateSignupPassword } from "@/lib/auth/password-policy";
import { PasswordInput } from "@/components/ui/password-input";
import { useTranslation } from "react-i18next";
import { PasswordStrength } from "@/components/auth/password-strength";

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
  const { t } = useTranslation();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const skipCaptcha = process.env.NEXT_PUBLIC_SKIP_CAPTCHA === "true";
  const captchaEnabled = !skipCaptcha && !!siteKey;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const isPasswordValid = 
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]|[^A-Za-z0-9]/.test(password);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch && firstName && lastName && email && (!captchaEnabled || captchaToken);

  /* Render the reCAPTCHA v2 checkbox once the script is ready */
  useEffect(() => {
    if (!captchaEnabled || !scriptLoaded) return;
    if (!captchaRef.current) return;

    const tryRender = () => {
      // If window.grecaptcha is ready and container is present
      if (window.grecaptcha && captchaRef.current) {
        // Only render if not already rendered
        if (widgetIdRef.current === null || captchaRef.current.innerHTML === "") {
          try {
            widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
              sitekey: siteKey,
              callback: (token: string) => setCaptchaToken(token),
              "expired-callback": () => setCaptchaToken(null),
            });
          } catch (e) {
            console.error("reCAPTCHA render error:", e);
          }
        }
      }
    };

    if (window.grecaptcha) {
      window.grecaptcha.ready(tryRender);
    }
  }, [captchaEnabled, scriptLoaded, siteKey]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError(t("auth.password_invalid"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("auth.passwords_do_not_match"));
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setError(t("auth.captcha_error"));
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
        throw new Error(data.error ?? t("auth.signup_failed"));
      }

      const em = data.data?.email ?? email;
      router.push(`/verify-email?email=${encodeURIComponent(em)}`);
    } catch (submissionError) {
      const nextMessage =
        submissionError instanceof Error
          ? submissionError.message
          : t("auth.signup_failed");
      setError(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-100/50">
      {/* Load reCAPTCHA v2 script (explicit render mode) */}
      {captchaEnabled && (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
          onReady={() => setScriptLoaded(true)}
        />
      )}

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("auth.create_your_account")}</h1>
        <p className="text-sm text-gray-500">
          {t("auth.signup_subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">{t("auth.first_name")}</span>
            <input
              type="text"
              required
              placeholder="John"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-500 transition-all"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">{t("auth.last_name")}</span>
            <input
              type="text"
              required
              placeholder="Doe"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-500 transition-all"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">{t("auth.email")}</span>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-500 transition-all"
          />
        </label>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">{t("auth.password")}</span>
            <PasswordInput
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
            />
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">{t("auth.confirm_password")}</span>
            <PasswordInput
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={`rounded-xl border-gray-300 px-4 py-2.5 transition-all ${
                passwordsMatch && isPasswordValid 
                  ? "border-green-500 ring-4 ring-green-500/10" 
                  : "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              }`}
            />
          </div>
        </div>

        {/* reCAPTCHA v2 checkbox widget */}
        {captchaEnabled ? (
          <div className="flex justify-center">
            <div ref={captchaRef} />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? t("auth.creating_account") : t("auth.create_account_btn")}
        </button>
      </form>

      {error ? (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      ) : null}

      <p className="mt-8 text-sm text-gray-600 text-center font-medium">
        {t("auth.already_registered")}{" "}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
          {t("auth.signin")}
        </Link>
      </p>

      <p className="mt-8 text-center text-[10px] leading-relaxed text-gray-400">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
          Terms of Service
        </a>{" "}
        apply.
      </p>
    </div>
  );
}

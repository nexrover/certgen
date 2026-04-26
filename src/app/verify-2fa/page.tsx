"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

function Verify2FaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins

  const nextPath = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    // Kick off sending OTP on mount
    fetch("/api/auth/2fa/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "login" }),
    }).catch(console.error);

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResend = async () => {
    setTimeLeft(300);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "login" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to resend");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "login", code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed");
      }

      window.location.href = nextPath;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-indigo-50/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600 shadow-inner">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 text-center tracking-tight">Two-Step Verification</h1>
        <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
          We&apos;ve sent a 6-digit verification code to your contact. Please enter it below to access your account.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wider">Verification Code</label>
          <input
            type="text"
            placeholder="000000"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold text-gray-900 outline-none ring-indigo-500 focus:bg-white focus:ring-4 focus:border-indigo-500 transition-all placeholder:text-gray-300"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium text-center animate-in fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isSubmitting ? "Verifying..." : "Verify & Continue"}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {timeLeft > 0 ? (
              <span>Code expires in <strong className="text-gray-900 font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</strong></span>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Resend Code
              </button>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}

export default function Verify2FaPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto mt-20 max-w-md p-8 text-center text-gray-500">Loading...</div>
    }>
      <Verify2FaContent />
    </Suspense>
  );
}

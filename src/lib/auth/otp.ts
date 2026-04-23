import { createHmac, randomInt } from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000;

export function otpExpiresAt(): string {
  return new Date(Date.now() + OTP_TTL_MS).toISOString();
}

export function generateSixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(email: string, code: string): string {
  const secret = process.env.OTP_HMAC_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-only";
  return createHmac("sha256", secret).update(`${email.toLowerCase().trim()}:${code}`).digest("hex");
}

export function verifyOtpHash(email: string, code: string, storedHash: string): boolean {
  const candidate = hashOtp(email, code);
  return timingSafeEqual(candidate, storedHash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

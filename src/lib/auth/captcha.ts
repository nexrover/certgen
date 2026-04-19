/**
 * Verify a reCAPTCHA v2 checkbox token with the Google siteverify API.
 * Returns true when the token is valid; false otherwise.
 *
 * Behaviour:
 *  - SKIP_CAPTCHA / NEXT_PUBLIC_SKIP_CAPTCHA = "true"  →  always pass
 *  - No RECAPTCHA_SECRET_KEY set                        →  always pass (dev convenience)
 *  - Token missing / invalid                            →  reject
 */
export async function verifyRecaptcha(token: string | null | undefined): Promise<boolean> {
  if (process.env.SKIP_CAPTCHA === "true" || process.env.NEXT_PUBLIC_SKIP_CAPTCHA === "true") {
    return true;
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    /* No secret configured — allow so signup isn't blocked in dev */
    console.warn("[captcha] RECAPTCHA_SECRET_KEY not set — skipping verification.");
    return true;
  }

  if (!token) return false;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return !!data.success;
}

/** @deprecated Use `verifyRecaptcha` instead. Kept for backwards compat. */
export const verifyRecaptchaV3 = verifyRecaptcha;

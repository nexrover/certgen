const ONE_DAY_SECONDS = 60 * 60 * 24;

/**
 * Aligns cookie lifetime with short-lived JWT (configure JWT expiry in Supabase Dashboard → Auth → JWT expiry, e.g. 86400s).
 * Refresh token rotation is handled by Supabase Auth when the session refreshes.
 */
export function getSupabaseCookieOptions() {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: ONE_DAY_SECONDS,
  } as const;
}

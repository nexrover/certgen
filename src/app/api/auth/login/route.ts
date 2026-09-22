import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { checkRateLimit } from "@/lib/auth/rate-limit-memory";
import { getClientIp } from "@/lib/auth/client-ip";
import {
  clearLoginFailures,
  getLockoutState,
  normalizeEmail,
  recordLoginFailure,
} from "@/lib/auth/lockout";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000); //10 attempts per 15 minutes
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many sign-in attempts from this network. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 400 });
  }

  const emailNorm = normalizeEmail(body.email);
  const lock = await getLockoutState(emailNorm);
  if (lock.locked && lock.lockedUntil) {
    const mins = Math.ceil((lock.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      {
        success: false,
        error: `Account temporarily locked after multiple failed attempts. Try again in about ${mins} minute(s).`,
      },
      { status: 423 }
    );
  }

  const supabase = await createRouteHandlerClient(body.rememberMe);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailNorm,
    password: body.password,
  });

  if (error) {
    await recordLoginFailure(emailNorm);
    return NextResponse.json(
      { success: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  await clearLoginFailures(emailNorm);

  const is2FaEnabled = data?.user?.user_metadata?.is_2fa_enabled;

  if (is2FaEnabled) {
    // Delete regular session cookies that were just set
    const res = NextResponse.json({ success: true, require2fa: true });

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    // Set temp session cookie with the jwt access token for 2FA verification
    const tokenPayload = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user.id,
      contact: data.user.user_metadata.two_factor_contact || data.user.email,
      remember_me: body.rememberMe
    };

    cookieStore.set("2fa_temp_session", JSON.stringify(tokenPayload), {
      path: "/",
      maxAge: 15 * 60, // 15 mins
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Clear the regular supabase cookies from cookieStore so the user isn't actually logged in yet
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
        cookieStore.delete(cookie.name);
      }
    }

    return res;
  }

  const res = NextResponse.json({ success: true });
  if (body.rememberMe) {
    res.cookies.set("remember_me", "1", {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, //one months
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    res.cookies.delete("remember_me");
  }

  return res;
}

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
  const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
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
  const { error } = await supabase.auth.signInWithPassword({
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

  const res = NextResponse.json({ success: true });
  if (body.rememberMe) {
    res.cookies.set("remember_me", "1", {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    res.cookies.delete("remember_me");
  }

  return res;
}

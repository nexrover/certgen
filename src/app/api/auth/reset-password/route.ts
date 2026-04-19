import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/auth/rate-limit-memory";
import { getClientIp } from "@/lib/auth/client-ip";
import { verifyOtpHash } from "@/lib/auth/otp";
import { normalizeEmail } from "@/lib/auth/lockout";
import { validateSignupPassword } from "@/lib/auth/password-policy";

const BodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`reset-pw:${ip}`, 20, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const pwError = validateSignupPassword(body.newPassword);
  if (pwError) {
    return NextResponse.json({ success: false, error: pwError }, { status: 400 });
  }

  const emailNorm = normalizeEmail(body.email);
  const admin = createAdminClient();

  const { data: row, error } = await admin
    .from("password_reset_otps")
    .select("id, user_id, code_hash, expires_at")
    .eq("email_normalized", emailNorm)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ success: false, error: "Invalid or expired code." }, { status: 400 });
  }

  const rec = row as { id: string; user_id: string; code_hash: string; expires_at: string };
  if (new Date(rec.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ success: false, error: "Code expired." }, { status: 400 });
  }

  const resetKey = `reset:${emailNorm}`;
  if (!verifyOtpHash(resetKey, body.code, rec.code_hash)) {
    return NextResponse.json({ success: false, error: "Invalid code." }, { status: 400 });
  }

  const { error: updError } = await admin.auth.admin.updateUserById(rec.user_id, {
    password: body.newPassword,
  });

  if (updError) {
    return NextResponse.json({ success: false, error: "Could not update password." }, { status: 500 });
  }

  await admin.from("password_reset_otps").delete().eq("id", rec.id);

  return NextResponse.json({ success: true });
}

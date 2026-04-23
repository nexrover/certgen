import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/auth/rate-limit-memory";
import { getClientIp } from "@/lib/auth/client-ip";
import { verifyOtpHash } from "@/lib/auth/otp";
import { normalizeEmail } from "@/lib/auth/lockout";

const BodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`verify-email:${ip}`, 30, 15 * 60 * 1000);
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
    return NextResponse.json({ success: false, error: "Invalid code." }, { status: 400 });
  }

  const emailNorm = normalizeEmail(body.email);
  const admin = createAdminClient();

  const { data: row, error } = await admin
    .from("email_verification_otps")
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
    return NextResponse.json({ success: false, error: "Code expired. Request a new one." }, { status: 400 });
  }

  if (!verifyOtpHash(emailNorm, body.code, rec.code_hash)) {
    return NextResponse.json({ success: false, error: "Invalid code." }, { status: 400 });
  }

  const { error: updError } = await admin.auth.admin.updateUserById(rec.user_id, {
    email_confirm: true,
  });

  if (updError) {
    return NextResponse.json({ success: false, error: "Could not verify email." }, { status: 500 });
  }

  await admin.from("email_verification_otps").delete().eq("id", rec.id);

  return NextResponse.json({ success: true });
}

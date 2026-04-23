import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/auth/rate-limit-memory";
import { getClientIp } from "@/lib/auth/client-ip";
import { generateSixDigitCode, hashOtp, otpExpiresAt } from "@/lib/auth/otp";
import { normalizeEmail } from "@/lib/auth/lockout";
import { sendTransactionalEmail } from "@/lib/auth/email";

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`resend-verify:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many resend attempts." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid email." }, { status: 400 });
  }

  const emailNorm = normalizeEmail(body.email);
  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("email_verification_otps")
    .select("user_id")
    .eq("email_normalized", emailNorm)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pending) {
    return NextResponse.json({ success: true });
  }

  const userId = (pending as { user_id: string }).user_id;
  const { data: userRow } = await admin.auth.admin.getUserById(userId);
  if (userRow.user?.email_confirmed_at) {
    return NextResponse.json({ success: true });
  }

  const code = generateSixDigitCode();
  const codeHash = hashOtp(emailNorm, code);
  const expiresAt = otpExpiresAt();

  await admin.from("email_verification_otps").delete().eq("email_normalized", emailNorm);
  await admin.from("email_verification_otps").insert({
    email_normalized: emailNorm,
    user_id: userId,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  const emailResult = await sendTransactionalEmail({
    to: emailNorm,
    subject: "Your verification code",
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`,
  });

  if (!emailResult.ok && process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.warn(`[dev] Resend OTP for ${emailNorm}: ${code}`);
  } else if (!emailResult.ok) {
    return NextResponse.json(
      { success: false, error: emailResult.error ?? "Could not send email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

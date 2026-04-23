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
  const rl = checkRateLimit(`forgot-pw:${ip}`, 8, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again later." },
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

  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const user = list?.users?.find((u) => u.email?.toLowerCase() === emailNorm);

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const code = generateSixDigitCode();
  const codeHash = hashOtp(`reset:${emailNorm}`, code);
  const expiresAt = otpExpiresAt();

  await admin.from("password_reset_otps").delete().eq("email_normalized", emailNorm);
  const { error: insError } = await admin.from("password_reset_otps").insert({
    email_normalized: emailNorm,
    user_id: user.id,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  if (insError) {
    return NextResponse.json({ success: false, error: "Could not process request." }, { status: 500 });
  }

  const emailResult = await sendTransactionalEmail({
    to: emailNorm,
    subject: "Your password reset code",
    html: `<p>Your password reset code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`,
  });

  if (!emailResult.ok && process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.warn(`[dev] Password reset OTP for ${emailNorm}: ${code}`);
  } else if (!emailResult.ok) {
    return NextResponse.json(
      { success: false, error: emailResult.error ?? "Could not send email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

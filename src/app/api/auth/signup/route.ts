import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRecaptchaV3 } from "@/lib/auth/captcha";
import { validateSignupPassword } from "@/lib/auth/password-policy";
import { checkRateLimit } from "@/lib/auth/rate-limit-memory";
import { getClientIp } from "@/lib/auth/client-ip";
import { generateSixDigitCode, hashOtp, otpExpiresAt } from "@/lib/auth/otp";
import { normalizeEmail } from "@/lib/auth/lockout";
import { sendTransactionalEmail } from "@/lib/auth/email";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  captchaToken: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`signup:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many sign-up attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const captchaOk = await verifyRecaptchaV3(body.captchaToken ?? null);
  if (!captchaOk) {
    return NextResponse.json({ success: false, error: "CAPTCHA verification failed." }, { status: 400 });
  }

  const pwError = validateSignupPassword(body.password);
  if (pwError) {
    return NextResponse.json({ success: false, error: pwError }, { status: 400 });
  }

  const emailNorm = normalizeEmail(body.email);
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: emailNorm,
    password: body.password,
    email_confirm: false,
    user_metadata: {
      first_name: body.firstName,
      last_name: body.lastName,
    },
  });

  if (createError || !created.user) {
    const msg = createError?.message ?? "Could not create account.";
    if (msg.toLowerCase().includes("already")) {
      return NextResponse.json(
        { success: false, error: "An account with this email may already exist." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }

  const userId = created.user.id;
  const code = generateSixDigitCode();
  const codeHash = hashOtp(emailNorm, code);
  const expiresAt = otpExpiresAt();

  await admin.from("email_verification_otps").delete().eq("email_normalized", emailNorm);
  const { error: insError } = await admin.from("email_verification_otps").insert({
    email_normalized: emailNorm,
    user_id: userId,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  if (insError) {
    return NextResponse.json({ success: false, error: "Could not issue verification code." }, { status: 500 });
  }

  const emailResult = await sendTransactionalEmail({
    to: emailNorm,
    subject: "Your verification code",
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`,
  });

  if (!emailResult.ok && process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.warn(`[dev] Verification OTP for ${emailNorm}: ${code}`);
  } else if (!emailResult.ok) {
    return NextResponse.json(
      { success: false, error: emailResult.error ?? "Could not send verification email." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { email: emailNorm },
  });
}

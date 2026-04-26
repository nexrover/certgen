import { createAdminClient } from "@/lib/supabase/admin";
import { generateSixDigitCode, hashOtp, otpExpiresAt } from "./otp";
import { sendTransactionalEmail } from "./email";

export async function send2FaOtp(userId: string, contact: string, purpose: 'enable' | 'disable' | 'login') {
  const supabase = createAdminClient();
  const code = generateSixDigitCode();
  const codeHash = hashOtp(contact, code);
  const expiresAt = otpExpiresAt();
  const emailNormalized = `${contact.toLowerCase().trim()}:2fa:${purpose}`;

  await supabase.from("email_verification_otps").delete().eq("email_normalized", emailNormalized).eq("user_id", userId);

  await supabase.from("email_verification_otps").insert({
    email_normalized: emailNormalized,
    user_id: userId,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  if (contact.includes('@')) {
    const emailResult = await sendTransactionalEmail({
      to: contact,
      subject: `Your 2FA Code - ${purpose}`,
      html: `<p>Your 6-digit verification code is: <strong>${code}</strong></p><p>This code will expire in 5 minutes.</p>`,
    });

    if (!emailResult.ok && process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
      console.warn(`[dev] Verification OTP for ${contact}: ${code}`);
    } else if (!emailResult.ok) {
      throw new Error(emailResult.error ?? "Could not send verification email.");
    }
  } else {
    // simulated SMS
    console.log(`[SMS to ${contact}] Your 2FA Code: ${code}`);
    // If they have actual SMS we could add Twilio here
  }

  return { success: true };
}

export async function verify2FaOtp(userId: string, contact: string, purpose: 'enable' | 'disable' | 'login', code: string) {
  const supabase = createAdminClient();
  const emailNormalized = `${contact.toLowerCase().trim()}:2fa:${purpose}`;
  const codeHash = hashOtp(contact, code);

  const { data } = await supabase
    .from("email_verification_otps")
    .select("id, expires_at")
    .eq("email_normalized", emailNormalized)
    .eq("user_id", userId)
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (!data) return false;

  const expiresAt = new Date(data.expires_at).getTime();
  if (expiresAt < Date.now()) return false;

  await supabase.from("email_verification_otps").delete().eq("id", data.id);
  return true;
}

import { getLockoutState, recordLoginFailure, clearLoginFailures } from "./lockout";

export async function get2FaLockoutState(userId: string) {
  return getLockoutState(`${userId}:2fa`);
}
export async function record2FaFailure(userId: string) {
  return recordLoginFailure(`${userId}:2fa`);
}
export async function clear2FaFailures(userId: string) {
  return clearLoginFailures(`${userId}:2fa`);
}

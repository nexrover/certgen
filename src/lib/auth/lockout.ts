import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getLockoutState(emailNormalized: string): Promise<{
  locked: boolean;
  lockedUntil: Date | null;
}> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("auth_login_lockouts")
    .select("locked_until, failed_count")
    .eq("email_normalized", emailNormalized)
    .maybeSingle();

  if (!data) {
    return { locked: false, lockedUntil: null };
  }

  const row = data as { locked_until: string | null; failed_count: number };
  if (!row.locked_until) {
    return { locked: false, lockedUntil: null };
  }

  const until = new Date(row.locked_until);
  if (until.getTime() > Date.now()) {
    return { locked: true, lockedUntil: until };
  }

  return { locked: false, lockedUntil: null };
}

export async function recordLoginFailure(emailNormalized: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("auth_login_lockouts")
    .select("failed_count")
    .eq("email_normalized", emailNormalized)
    .maybeSingle();

  const prev = (existing as { failed_count: number } | null)?.failed_count ?? 0;
  const next = prev + 1;
  const lockedUntil =
    next >= MAX_FAILURES
      ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
      : null;

  await supabase.from("auth_login_lockouts").upsert(
    {
      email_normalized: emailNormalized,
      failed_count: next,
      locked_until: lockedUntil,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email_normalized" }
  );
}

export async function clearLoginFailures(emailNormalized: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("auth_login_lockouts").upsert(
    {
      email_normalized: emailNormalized,
      failed_count: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email_normalized" }
  );
}

-- Email verification OTPs (6-digit, 5-minute validity enforced in app)
create table if not exists public.email_verification_otps (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_verification_otps_email on public.email_verification_otps (email_normalized);
create index if not exists idx_email_verification_otps_expires on public.email_verification_otps (expires_at);

alter table public.email_verification_otps enable row level security;

-- Password reset OTPs
create table if not exists public.password_reset_otps (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_otps_email on public.password_reset_otps (email_normalized);

alter table public.password_reset_otps enable row level security;

-- Login lockout / failed attempts (per email)
create table if not exists public.auth_login_lockouts (
  email_normalized text primary key,
  failed_count int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.auth_login_lockouts enable row level security;

-- No policies: access only via service role in API routes.

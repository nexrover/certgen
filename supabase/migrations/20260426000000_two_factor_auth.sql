-- Two Factor Authentication OTPs
create table if not exists public.two_factor_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_normalized text not null,
  code_hash text not null,
  purpose text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_two_factor_otps_user on public.two_factor_otps (user_id);
create index if not exists idx_two_factor_otps_expires on public.two_factor_otps (expires_at);

alter table public.two_factor_otps enable row level security;

-- 2FA Lockouts for Brute Force Protection
create table if not exists public.auth_2fa_lockouts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  failed_count int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.auth_2fa_lockouts enable row level security;

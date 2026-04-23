-- Multi-tenant isolation for user-owned tables.
-- This migration is idempotent and safe to rerun.

do $$
begin
  if to_regclass('public.certificate_templates') is not null then
    alter table public.certificate_templates
      add column if not exists user_id uuid references auth.users(id) on delete cascade;
    alter table public.certificate_templates
      alter column user_id set default auth.uid();
    create index if not exists idx_certificate_templates_user_id
      on public.certificate_templates(user_id);
    alter table public.certificate_templates enable row level security;
    drop policy if exists "certificate_templates_select_own" on public.certificate_templates;
    drop policy if exists "certificate_templates_insert_own" on public.certificate_templates;
    drop policy if exists "certificate_templates_update_own" on public.certificate_templates;
    drop policy if exists "certificate_templates_delete_own" on public.certificate_templates;
    create policy "certificate_templates_select_own"
      on public.certificate_templates for select
      using (auth.uid() = user_id);
    create policy "certificate_templates_insert_own"
      on public.certificate_templates for insert
      with check (auth.uid() = user_id);
    create policy "certificate_templates_update_own"
      on public.certificate_templates for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    create policy "certificate_templates_delete_own"
      on public.certificate_templates for delete
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.generation_jobs') is not null then
    alter table public.generation_jobs
      add column if not exists user_id uuid references auth.users(id) on delete cascade;
    alter table public.generation_jobs
      alter column user_id set default auth.uid();
    create index if not exists idx_generation_jobs_user_id
      on public.generation_jobs(user_id);
    alter table public.generation_jobs enable row level security;
    drop policy if exists "generation_jobs_select_own" on public.generation_jobs;
    drop policy if exists "generation_jobs_insert_own" on public.generation_jobs;
    drop policy if exists "generation_jobs_update_own" on public.generation_jobs;
    drop policy if exists "generation_jobs_delete_own" on public.generation_jobs;
    create policy "generation_jobs_select_own"
      on public.generation_jobs for select
      using (auth.uid() = user_id);
    create policy "generation_jobs_insert_own"
      on public.generation_jobs for insert
      with check (auth.uid() = user_id);
    create policy "generation_jobs_update_own"
      on public.generation_jobs for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    create policy "generation_jobs_delete_own"
      on public.generation_jobs for delete
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.certificates') is not null then
    alter table public.certificates
      add column if not exists user_id uuid references auth.users(id) on delete cascade;
    alter table public.certificates
      alter column user_id set default auth.uid();
    create index if not exists idx_certificates_user_id
      on public.certificates(user_id);
    alter table public.certificates enable row level security;
    drop policy if exists "certificates_select_own" on public.certificates;
    drop policy if exists "certificates_insert_own" on public.certificates;
    drop policy if exists "certificates_update_own" on public.certificates;
    drop policy if exists "certificates_delete_own" on public.certificates;
    create policy "certificates_select_own"
      on public.certificates for select
      using (auth.uid() = user_id);
    create policy "certificates_insert_own"
      on public.certificates for insert
      with check (auth.uid() = user_id);
    create policy "certificates_update_own"
      on public.certificates for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    create policy "certificates_delete_own"
      on public.certificates for delete
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.projects') is not null then
    alter table public.projects
      add column if not exists user_id uuid references auth.users(id) on delete cascade;
    alter table public.projects
      alter column user_id set default auth.uid();
    create index if not exists idx_projects_user_id
      on public.projects(user_id);
    alter table public.projects enable row level security;
    drop policy if exists "projects_select_own" on public.projects;
    drop policy if exists "projects_insert_own" on public.projects;
    drop policy if exists "projects_update_own" on public.projects;
    drop policy if exists "projects_delete_own" on public.projects;
    create policy "projects_select_own"
      on public.projects for select
      using (auth.uid() = user_id);
    create policy "projects_insert_own"
      on public.projects for insert
      with check (auth.uid() = user_id);
    create policy "projects_update_own"
      on public.projects for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    create policy "projects_delete_own"
      on public.projects for delete
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.user_data') is not null then
    alter table public.user_data
      add column if not exists user_id uuid references auth.users(id) on delete cascade;
    alter table public.user_data
      alter column user_id set default auth.uid();
    create index if not exists idx_user_data_user_id
      on public.user_data(user_id);
    alter table public.user_data enable row level security;
    drop policy if exists "user_data_select_own" on public.user_data;
    drop policy if exists "user_data_insert_own" on public.user_data;
    drop policy if exists "user_data_update_own" on public.user_data;
    drop policy if exists "user_data_delete_own" on public.user_data;
    create policy "user_data_select_own"
      on public.user_data for select
      using (auth.uid() = user_id);
    create policy "user_data_insert_own"
      on public.user_data for insert
      with check (auth.uid() = user_id);
    create policy "user_data_update_own"
      on public.user_data for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
    create policy "user_data_delete_own"
      on public.user_data for delete
      using (auth.uid() = user_id);
  end if;
end $$;

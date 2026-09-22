create table if not exists public.recipient_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  headers jsonb not null default '[]'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recipient_lists enable row level security;

create policy "Users can view their own recipient lists"
  on public.recipient_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recipient lists"
  on public.recipient_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipient lists"
  on public.recipient_lists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own recipient lists"
  on public.recipient_lists for delete
  using (auth.uid() = user_id);

create index idx_recipient_lists_user_id on public.recipient_lists(user_id);

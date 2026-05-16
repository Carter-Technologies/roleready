-- RoleReady V2: profiles, generations history, RLS
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Extend cv_requests if it already exists from V1
create table if not exists public.cv_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  original_cv text not null,
  job_description text not null,
  tailored_cv text,
  cover_letter text,
  job_title text,
  user_id uuid references auth.users (id) on delete cascade
);

alter table public.cv_requests
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.cv_requests
  add column if not exists job_title text;

alter table public.cv_requests
  add column if not exists created_at timestamptz default now();

-- Profiles (master CV + display name)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  master_cv text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.cv_requests enable row level security;

-- Profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Generations: users manage only their rows
drop policy if exists "Users can view own generations" on public.cv_requests;
create policy "Users can view own generations"
  on public.cv_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own generations" on public.cv_requests;
create policy "Users can insert own generations"
  on public.cv_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own generations" on public.cv_requests;
create policy "Users can update own generations"
  on public.cv_requests for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own generations" on public.cv_requests;
create policy "Users can delete own generations"
  on public.cv_requests for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for history queries
create index if not exists cv_requests_user_created_idx
  on public.cv_requests (user_id, created_at desc);

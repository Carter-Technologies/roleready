-- RoleReady V4: job tracker, interview prep storage, agent drafts
-- Run in Supabase SQL Editor after 002_v3_ats.sql

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role_title text not null,
  job_url text,
  status text not null default 'wishlist'
    check (status in ('wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')),
  notes text,
  applied_at timestamptz,
  follow_up_at timestamptz,
  interview_at timestamptz,
  primary_cv_request_id uuid references public.cv_requests (id) on delete set null,
  interview_prep jsonb,
  follow_up_draft text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cv_requests
  add column if not exists application_id uuid references public.job_applications (id) on delete set null;

create index if not exists job_applications_user_updated_idx
  on public.job_applications (user_id, updated_at desc);

create index if not exists cv_requests_application_idx
  on public.cv_requests (application_id);

alter table public.job_applications enable row level security;

drop policy if exists "Users can view own applications" on public.job_applications;
create policy "Users can view own applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own applications" on public.job_applications;
create policy "Users can insert own applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own applications" on public.job_applications;
create policy "Users can update own applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own applications" on public.job_applications;
create policy "Users can delete own applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

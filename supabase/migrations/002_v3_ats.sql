-- RoleReady V3: ATS analysis on cv_requests
-- Run in Supabase SQL Editor after 001_v2_auth_and_rls.sql

alter table public.cv_requests
  add column if not exists ats_score integer;

alter table public.cv_requests
  add column if not exists ats_analysis jsonb;

comment on column public.cv_requests.ats_score is 'Overall ATS fit score 0-100';
comment on column public.cv_requests.ats_analysis is 'Full V3 analysis JSON';

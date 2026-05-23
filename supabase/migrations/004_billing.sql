-- RoleReady: billing / paywall on profiles

alter table public.profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro'));

alter table public.profiles
  add column if not exists tailor_usage_month text;

alter table public.profiles
  add column if not exists tailor_usage_count integer not null default 0;

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.profiles
  add column if not exists stripe_subscription_id text;

alter table public.profiles
  add column if not exists subscription_status text;

comment on column public.profiles.plan is 'free | pro';
comment on column public.profiles.tailor_usage_month is 'YYYY-MM for free tier monthly tailor limit';
comment on column public.profiles.tailor_usage_count is 'Tailor runs used in tailor_usage_month (free max 1)';

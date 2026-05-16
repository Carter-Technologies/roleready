# RoleReady V3 — Production checklist

## On Vercel

- [ ] Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`
- [ ] Redeploy after env changes
- [ ] `POST /api/analyze-ats` returns JSON (not `FUNCTION_INVOCATION_FAILED`)

## On Supabase (production)

- [ ] Run `supabase/migrations/002_v3_ats.sql` (adds `ats_score`, `ats_analysis`)

## App URLs

- Landing shows **V3 — ATS intelligence**
- `/app` — Analyze ATS fit + Tailor my CV
- `/history` — ATS score + report when saved

# RoleReady V2 — Verified working

**Date:** 2026-05-13

## Verified locally

- [x] Auth (sign up / log in)
- [x] CV tailoring via `/api/generate`
- [x] PDF upload via `/api/parse-cv`
- [x] TXT upload
- [x] Saved history (Supabase `cv_requests`)
- [x] Exports (copy, TXT, PDF, DOCX)
- [x] Single-terminal dev: `npm run dev`

## Stack

- Frontend: Vite + React + Tailwind
- API: Vercel serverless (`api/generate`, `api/parse-cv`)
- Database: Supabase (Postgres + Auth + RLS)

## Database backup

See `scripts/backup-db.sh` and `supabase/backups/`.

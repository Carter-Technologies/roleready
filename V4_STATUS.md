# RoleReady V4 — Job tracker + interview prep + agents

## Features

- **Job tracker** (`/tracker`) — Kanban: wishlist → applied → screening → interview → offer
- **Auto-track on tailor** — Saving from `/app` creates a tracker card (status: applied)
- **History → tracker** — “Add to tracker” for older generations
- **Interview prep** — AI questions, STAR outlines, questions to ask (per application)
- **Follow-up agent** — Draft follow-up email (copy only; no auto-send)

## APIs (Vercel Edge)

- `POST /api/interview-prep` — `{ cv, jobDesc, company }`
- `POST /api/draft-follow-up` — `{ cv, jobDesc, company, roleTitle, notes? }`

## Database

Run in Supabase SQL Editor (after `002_v3_ats.sql`):

`supabase/migrations/003_v4_tracker.sql`

## Vercel env

Same as V3: `VITE_SUPABASE_*`, `OPENROUTER_API_KEY`

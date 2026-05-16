# RoleReady

AI-powered job application platform — tailor your CV and cover letter to any job in seconds.

## Features

### V3 — ATS intelligence
- **ATS analysis** — `/api/analyze-ats` (keyword scoring, missing skills, ATS tips, resume feedback)
- **Analyze + tailor** — Dashboard: analyze fit, then generate tailored CV and cover letter
- **History** — ATS score and full report saved per generation

### V2
- **Accounts** — Supabase Auth (email/password)
- **Master CV** — save once, reuse on every application
- **PDF / TXT upload** — TXT in browser; PDF parsed via `/api/parse-cv` (server-side)
- **Saved history** — all generations per user (RLS-protected)
- **Exports** — Copy, TXT, PDF, DOCX
- **Backend API** — `/api/generate` on Vercel (OpenRouter key server-side)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations in the SQL Editor (in order):
   - `supabase/migrations/001_v2_auth_and_rls.sql`
   - `supabase/migrations/002_v3_ats.sql`
3. Under **Authentication → Providers**, enable Email. For local dev you may disable “Confirm email” under Email settings.
4. Copy **Project URL** and **anon key** into `.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. OpenRouter

Add to `.env` locally and Vercel **Environment Variables** (not `VITE_`):

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

### 3. Install & run

```bash
npm install
npm run dev
```

`npm run dev` runs Vite **and** local `/api/*` routes (PDF parse + CV generate) — no second terminal needed.

Optional: `npm run dev:vercel` to test exactly like production.

### Database backup (local)

Add `SUPABASE_DB_URL` to `.env` (Supabase → Settings → Database → URI), then:

```bash
./scripts/backup-db.sh
```

Dumps are saved to `supabase/backups/` (gitignored). Install `pg_dump` if needed: `brew install libpq`.

## Deploy (Vercel)

1. Connect repo **Carter-Technologies/roleready** (root `./`).
2. **Environment variables** (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY` (server-only, no `VITE_` prefix)
3. **Supabase production**: run `002_v3_ats.sql` if not already applied.
4. Deploy from `main` — `vercel.json` sets Vite build + API routes.

Settings: Build `npm run build`, Output `dist`, Node.js **22.x**.

After deploy, test: `POST https://your-app.vercel.app/api/analyze-ats` with JSON `{ "cv": "...", "jobDesc": "..." }` — should return `{ "analysis": { ... } }`, not `FUNCTION_INVOCATION_FAILED`.

## Project structure

```
api/generate.ts         # Serverless CV generation
api/analyze-ats.ts      # Serverless ATS analysis (V3)
api/parse-cv.ts         # Serverless PDF text extraction
api/_lib/               # Shared API logic (bundled with routes)
src/pages/              # Landing, Auth, Dashboard, History
src/contexts/           # Auth provider
src/lib/                # Supabase, exports, PDF parse, history
supabase/migrations/    # RLS + V3 ATS columns
```

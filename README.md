# RoleReady

AI-powered job application platform — tailor your CV and cover letter to any job in seconds.

## V2 features

- **Accounts** — Supabase Auth (email/password)
- **Master CV** — save once, reuse on every application
- **PDF / TXT upload** — TXT in browser; PDF parsed via `/api/parse-cv` (server-side)
- **Saved history** — all generations per user (RLS-protected)
- **Exports** — Copy, TXT, PDF, DOCX
- **Backend API** — `/api/generate` on Vercel (OpenRouter key server-side)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/001_v2_auth_and_rls.sql` in the SQL Editor.
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

- Root directory: `./`
- Build: `npm run build`
- Output: `dist`
- Node.js: **22.x**
- Env: `VITE_SUPABASE_*`, `OPENROUTER_API_KEY`

## Project structure

```
api/generate.ts       # Serverless CV generation
api/parse-cv.ts       # Serverless PDF text extraction
src/pages/            # Landing, Auth, Dashboard, History
src/contexts/         # Auth provider
src/lib/              # Supabase, exports, PDF parse, history
supabase/migrations/  # RLS + profiles schema
```

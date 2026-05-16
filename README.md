# RoleReady

AI-powered job application platform — tailor your CV and cover letter to any job in seconds.

## V2 features

- **Accounts** — Supabase Auth (email/password)
- **Master CV** — save once, reuse on every application
- **PDF / TXT upload** — extract CV text in the browser
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

### 2. OpenRouter (Vercel)

Add to Vercel **Environment Variables** (not `VITE_`):

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

For local API routes, add the same to `.env` and run:

```bash
npx vercel dev
```

In another terminal:

```bash
npm run dev
```

Vite proxies `/api` to port 3000.

### 3. Install & run

```bash
npm install
npm run dev
```

## Deploy (Vercel)

- Root directory: `./`
- Build: `npm run build`
- Output: `dist`
- Node.js: **22.x**
- Env: `VITE_SUPABASE_*`, `OPENROUTER_API_KEY`

## Project structure

```
api/generate.ts       # Serverless CV generation
src/pages/            # Landing, Auth, Dashboard, History
src/contexts/         # Auth provider
src/lib/              # Supabase, exports, PDF parse, history
supabase/migrations/  # RLS + profiles schema
```

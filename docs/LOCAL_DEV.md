# Local development (Phase 0)

Match production code on your machine before building V5.

## Quick start

```bash
git pull origin main
npm install
cp .env.local.example .env.local   # if you don't have .env.local yet
npm run dev                        # http://localhost:5173
```

## Environment

| File | Purpose |
|------|---------|
| `.env` | Shared secrets (Supabase, OpenRouter, Stripe) — never commit |
| `.env.local` | **Local overrides** — `VITE_APP_URL`, test Stripe keys |

Vite loads `.env` then `.env.local` (local wins).

### Required in `.env`

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (billing, Pro checks, APIs in dev plugin)
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO_MONTHLY`
- `VITE_APP_URL` — use **`http://localhost:5173` in `.env.local`**, not production URL

### Stripe locally

Use **test** keys in `.env.local` to override live keys from `.env`:

- `sk_test_...` + test `price_...`
- Test card: `4242 4242 4242 4242`

Checkout/webhooks closer to prod: `npm run dev:vercel`

### Site lock

- **Local `npm run dev`:** unlocked by default (full app, not coming-soon)
- **Production:** needs `VITE_SITE_LIVE=true` and `SITE_LIVE=true` on Vercel

### Supabase redirects

Authentication → URL Configuration must include:

- `http://localhost:5173/reset-password`
- `https://www.kigho.com/reset-password`

## Verify V4 (smoke test)

1. Sign up / log in
2. Upload PDF → tailor → bullet CV in UI
3. History saves generation
4. Pro: tracker, ATS, interview prep (set test Pro or subscribe with test Stripe)
5. Account settings, legal pages in footer

## Build check

```bash
npm run build
```

Should match what Vercel deploys from `main`.

## Local Pro account (testing)

Sign up once in the app, then grant Pro without Stripe:

```bash
node scripts/grant-pro.mjs you@email.com
```

Revert to free:

```bash
node scripts/grant-pro.mjs you@email.com --free
```

Uses `SUPABASE_SERVICE_ROLE_KEY` from `.env`. **If `.env` points at production Supabase, this upgrades that real account** — use a test email or staging project when possible.

After granting, refresh the app or sign out/in. Tracker, ATS, and unlimited tailoring should unlock.

## V5 — Formatted CV (local testing)

On branch `feature/v5-formatted-docx`:

1. Tailor a CV as usual (bullet view unchanged)
2. Click **Formatted DOCX** (Pro) next to the tailored CV on Dashboard or History
3. A structured Word file downloads with sections, headings, and bullets

Requires `OPENROUTER_API_KEY` and Pro status (`grant-pro` script above).

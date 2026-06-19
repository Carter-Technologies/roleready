# Billing & paywall

## Plans

| Feature | Free | Pro |
|---------|------|-----|
| CV tailoring | 1 per calendar month | Unlimited |
| History | View saved generation(s) | Full history |
| Master CV + PDF upload | Yes | Yes |
| ATS analysis | No | Yes |
| Job tracker | No | Yes |
| Interview prep / follow-up | No | Yes |

## Supabase

Run `supabase/migrations/004_billing.sql` in the SQL Editor after V2–V4 migrations.

## Stripe

Production uses **Stripe Live mode** on `https://www.kigho.com`.

### Live mode (production)

- **`STRIPE_SECRET_KEY`** → `sk_live_...` (Vercel Production)
- **`STRIPE_PRICE_ID_PRO_MONTHLY`** → live `price_...` (not `prod_...`)
- **`STRIPE_WEBHOOK_SECRET`** → live `whsec_...` from the **live** webhook endpoint
- Webhook URL: `https://www.kigho.com/api/stripe-webhook`
- Events: `checkout.session.completed`, subscription **updated**, subscription **deleted**
- **`VITE_APP_URL`** → `https://www.kigho.com` (checkout success/cancel redirects)

Redeploy Vercel after changing any env var.

### Test mode (local / sandbox)

- Use **`sk_test_...`**, test `price_...`, and test `whsec_...` in local `.env` or Vercel Preview.
- Test card: `4242 4242 4242 4242` — does **not** work in live mode.

### Setup

1. Create **Kigho Pro** with a recurring price in Stripe (test or live).
2. Copy the **Price ID** (`price_...`) → `STRIPE_PRICE_ID_PRO_MONTHLY`.
3. Vercel Production env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_APP_URL`.
4. Enable **Customer portal** in Stripe (Settings → Billing).

## Local dev

- `npm run dev` enforces auth on all AI routes.
- Billing limits apply only when `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise dev skips quota checks (still requires sign-in).
- Stripe checkout/portal need `vercel dev` or production deploy.

## API auth

All AI routes require `Authorization: Bearer <supabase_access_token>`.

- `402` + `code: UPGRADE_REQUIRED` — free limit or Pro-only feature
- `401` — not signed in

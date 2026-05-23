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

### Test mode (sandbox) — current production setup

RoleReady is configured for **Stripe Test mode** (Dashboard toggle: **Test mode** on).

- Use **`sk_test_...`** for `STRIPE_SECRET_KEY` and a **test** Price ID (`price_...` from the test product).
- Create the webhook in **test mode**; use that endpoint’s **`whsec_...`** for `STRIPE_WEBHOOK_SECRET`.
- Checkout accepts [test cards](https://docs.stripe.com/testing#cards) only (e.g. `4242 4242 4242 4242`). No real charges.
- When going live, swap Vercel env vars to **live** keys, a live Price ID, and a **live** webhook signing secret, then redeploy.

### Setup

1. Create a **Product** (e.g. RoleReady Pro) with a recurring **Price** (e.g. €12/month) in **Test mode**.
2. Copy the Price ID → `STRIPE_PRICE_ID_PRO_MONTHLY`.
3. Add env vars in Vercel (and local `.env` for `vercel dev`):
   - `STRIPE_SECRET_KEY` (`sk_test_...` while in sandbox)
   - `STRIPE_WEBHOOK_SECRET` (from the **test** webhook endpoint)
   - `STRIPE_PRICE_ID_PRO_MONTHLY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Webhook endpoint: `https://your-app.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Checkout success URL: `/app?checkout=success` (profile refresh on Dashboard).

## Local dev

- `npm run dev` enforces auth on all AI routes.
- Billing limits apply only when `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise dev skips quota checks (still requires sign-in).
- Stripe checkout/portal need `vercel dev` or production deploy.

## API auth

All AI routes require `Authorization: Bearer <supabase_access_token>`.

- `402` + `code: UPGRADE_REQUIRED` — free limit or Pro-only feature
- `401` — not signed in

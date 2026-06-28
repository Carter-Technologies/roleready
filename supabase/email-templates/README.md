# Kigho — Supabase auth email templates

Production-ready HTML for Supabase **Authentication → Email Templates**.

## How to apply

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Email Templates**.
2. Paste each file’s HTML into the matching template body.
3. Set the subject lines below.
4. Under **Authentication → URL Configuration**, ensure:
   - **Site URL:** `https://www.kigho.com`
   - **Redirect URLs** include:
     - `https://www.kigho.com/reset-password`
     - `http://localhost:5173/reset-password` (local dev)

## Templates

| Supabase template | File | Subject |
|-------------------|------|---------|
| **Confirm signup** | `confirm-email.html` | `Welcome to Kigho — Confirm your email` |
| **Reset password** | `reset-password.html` | `Reset your Kigho password` |

## Placeholders

Both templates use Supabase’s required link variable:

- `{{ .ConfirmationURL }}` — confirmation / recovery URL (do not change)

Optional variables available if needed later: `{{ .Email }}`, `{{ .SiteURL }}`, `{{ .Token }}`.

## Brand

- Button colour: `#6b7c3f` (Kigho olive)
- Logo: olive **K** badge + **Kigho** wordmark (email-safe, no external images)
- Operator contact: `info@copperfield.ie`

## PKCE / mobile note

If users see “PKCE code verifier not found” after tapping a reset link, they opened the email in a different browser than the one that requested the reset. Ask them to open the link in the same browser, or request a new reset from [kigho.com/forgot-password](https://www.kigho.com/forgot-password).

# Kigho — Supabase auth email templates

Production-ready HTML for Supabase Authentication emails. Copy each file into the Supabase Dashboard.

## Apply in Supabase

1. Open your project → **Authentication** → **Email Templates**
2. Set **Site URL** to `https://www.kigho.com` (and add redirect URLs for `/reset-password` if not already)
3. Update each template below

### Confirm signup

| Field | Value |
|-------|--------|
| **Subject** | `Welcome to Kigho — Confirm your email` |
| **Body** | Paste contents of `confirm-email.html` |

Uses `{{ .ConfirmationURL }}` for the confirm button link.

### Reset password (Recovery)

| Field | Value |
|-------|--------|
| **Subject** | `Reset your Kigho password` |
| **Body** | Paste contents of `reset-password.html` |

Uses `{{ .ConfirmationURL }}` for the reset button link.

## Brand

- **Product:** Kigho — AI-powered CV and cover letter platform
- **Operator:** Copperfield
- **Button colour:** `#6b7c3f` (Kigho olive)
- **Support:** support@kigho.com

## Logo

Templates use an HTML wordmark (olive **K** badge + “Kigho” text) so they render reliably on white backgrounds in Gmail, Outlook, and Apple Mail.

To use the image logo instead, replace the logo table row with:

```html
<img src="https://www.kigho.com/logo.png" width="120" height="auto" alt="Kigho" style="display:block;margin:0 auto;max-width:120px;height:auto;" />
```

Note: `public/logo.png` has a dark background; prefer a white-background export for email if you switch to an image.

## Sender name (optional)

Under **Authentication** → **SMTP Settings** or your custom SMTP provider, set the sender name to **Kigho** and a from address you control (e.g. `noreply@kigho.com` or your SMTP domain).

## Test

1. Sign up with a test email and confirm the welcome email renders correctly.
2. Use **Forgot password** on https://www.kigho.com/forgot-password and check the reset email.
3. Click through both links and confirm redirects work.

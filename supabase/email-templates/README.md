# Kigho — Supabase auth email templates

Branded HTML templates for Supabase Authentication emails. Copy the HTML into **Supabase Dashboard → Authentication → Email Templates**.

## Apply in Supabase

1. Open your project in [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication → Email Templates**.
3. Set **Site URL** to `https://www.kigho.com` under **Authentication → URL Configuration** (if not already).
4. Add these **Redirect URLs** (include localhost for dev):

```
https://www.kigho.com/auth/callback
https://www.kigho.com/auth/callback/**
https://www.kigho.com/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/auth/callback/**
http://localhost:5173/reset-password
```

The app uses `/auth/callback` so email confirmation and password reset return users to Kigho automatically.

### Confirm signup

| Field | Value |
|-------|--------|
| **Subject** | `Welcome to Kigho — Confirm your email` |
| **Body** | Paste contents of `confirm-signup.html` |

### Reset password (Recovery)

| Field | Value |
|-------|--------|
| **Subject** | `Reset your Kigho password` |
| **Body** | Paste contents of `reset-password.html` |

## Template variables

These templates use Supabase GoTrue placeholders only for action links:

| Variable | Usage |
|----------|--------|
| `{{ .ConfirmationURL }}` | Confirm email / reset password button `href` |

Do not replace `{{ .ConfirmationURL }}` with a hardcoded URL.

## Brand

- **Product:** Kigho
- **Operator:** Copperfield
- **Support:** info@copperfield.ie
- **Button colour:** `#6b7c3f` (Kigho olive)
- **Logo:** HTML “K” badge + wordmark (no external image dependency; works when images are blocked)

## Local development

If you use Supabase CLI, you can wire templates in `supabase/config.toml`:

```toml
[auth.email.template.confirmation]
subject = "Welcome to Kigho — Confirm your email"
content_path = "./supabase/email-templates/confirm-signup.html"

[auth.email.template.recovery]
subject = "Reset your Kigho password"
content_path = "./supabase/email-templates/reset-password.html"
```

Then restart local Supabase: `supabase stop && supabase start`.

## Testing

1. Sign up with a real inbox you control → confirm email renders correctly.
2. Use **Forgot password** on `/forgot-password` → recovery email renders correctly.
3. Check Gmail, Apple Mail, and Outlook if possible.

## Optional: hosted logo image

To use the favicon as an image above the wordmark, add this inside the logo `<td>` (keep the text badge as fallback):

```html
<img src="{{ .SiteURL }}/favicon-96.png" width="40" height="40" alt="Kigho" style="display:block;border:0;border-radius:12px;" />
```

`{{ .SiteURL }}` must match your production app URL in Supabase URL configuration.

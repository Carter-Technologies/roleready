/** Canonical app origin for Supabase auth redirects (email confirm, password reset). */
export function getAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  const configured = import.meta.env.VITE_APP_URL?.trim();
  return configured || "https://www.kigho.com";
}

export function authCallbackUrl(nextPath: string): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${getAppUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

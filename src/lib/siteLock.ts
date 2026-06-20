/** When true, the app shows a coming-soon page and APIs return 503. Set in Vercel / .env. */
export function isSiteLocked(): boolean {
  const v = import.meta.env.VITE_SITE_LOCKED;
  return v === "true" || v === "1";
}

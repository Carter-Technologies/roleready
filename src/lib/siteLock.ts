/** Coming soon in production until VITE_SITE_LIVE=true. Override with VITE_SITE_LOCKED=true locally. */
export function isSiteLocked(): boolean {
  const live = import.meta.env.VITE_SITE_LIVE;
  if (live === "true" || live === "1") return false;

  const locked = import.meta.env.VITE_SITE_LOCKED;
  if (locked === "true" || locked === "1") return true;

  return import.meta.env.PROD;
}

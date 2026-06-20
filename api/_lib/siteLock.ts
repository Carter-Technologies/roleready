function isExplicitlyLive(): boolean {
  const v = process.env.VITE_SITE_LIVE ?? process.env.SITE_LIVE;
  return v === "true" || v === "1";
}

function isExplicitlyLocked(): boolean {
  const v = process.env.SITE_LOCKED ?? process.env.VITE_SITE_LOCKED;
  return v === "true" || v === "1";
}

function isProductionRuntime(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

/** Coming soon in production until VITE_SITE_LIVE=true. */
export function isSiteLocked(): boolean {
  if (isExplicitlyLive()) return false;
  if (isExplicitlyLocked()) return true;
  return isProductionRuntime();
}

export function siteLockedResponse(): Response {
  return Response.json({ error: "Site temporarily unavailable" }, { status: 503 });
}

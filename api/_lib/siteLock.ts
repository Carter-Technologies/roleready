export function isSiteLocked(): boolean {
  const v = process.env.SITE_LOCKED ?? process.env.VITE_SITE_LOCKED;
  return v === "true" || v === "1";
}

export function siteLockedResponse(): Response {
  return Response.json({ error: "Site temporarily unavailable" }, { status: 503 });
}

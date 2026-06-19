import type { Profile } from "./types";

/** Defaults for profiles created before billing migration or partial selects. */
export function normalizeProfile(row: Record<string, unknown> | null): Profile | null {
  if (!row || typeof row.id !== "string") return null;
  return {
    id: row.id,
    email: (row.email as string | null) ?? null,
    full_name: (row.full_name as string | null) ?? null,
    master_cv: (row.master_cv as string | null) ?? null,
    plan: row.plan === "pro" ? "pro" : "free",
    tailor_usage_month: (row.tailor_usage_month as string | null) ?? null,
    tailor_usage_count: typeof row.tailor_usage_count === "number" ? row.tailor_usage_count : 0,
    stripe_customer_id: (row.stripe_customer_id as string | null) ?? null,
    stripe_subscription_id: (row.stripe_subscription_id as string | null) ?? null,
    subscription_status: (row.subscription_status as string | null) ?? null,
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

export function isPro(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  return profile.plan === "pro" && profile.subscription_status === "active";
}

export function currentUsageMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function freeTailorRemaining(profile: Profile | null | undefined): number {
  if (!profile) return 0;
  if (isPro(profile)) return Infinity;
  const month = currentUsageMonth();
  const used =
    profile.tailor_usage_month === month ? profile.tailor_usage_count : 0;
  return Math.max(0, 1 - used);
}

export function canTailor(profile: Profile | null | undefined): boolean {
  if (!profile) return true;
  return freeTailorRemaining(profile) > 0;
}

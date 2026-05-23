import { getSupabaseAdmin } from "./supabaseAdmin";

export type UserPlan = {
  plan: "free" | "pro";
  tailor_usage_month: string | null;
  tailor_usage_count: number;
  subscription_status: string | null;
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function isPro(profile: UserPlan): boolean {
  return profile.plan === "pro" && profile.subscription_status === "active";
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select("plan, tailor_usage_month, tailor_usage_count, subscription_status")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Profile not found");
  }

  return data as UserPlan;
}

export class BillingError extends Error {
  code: "UPGRADE_REQUIRED" | "UNAUTHORIZED";

  constructor(code: BillingError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

export async function assertProFeature(userId: string, feature: string) {
  const profile = await getUserPlan(userId);
  if (!isPro(profile)) {
    throw new BillingError(
      "UPGRADE_REQUIRED",
      `${feature} is available on Pro. Upgrade for unlimited access.`
    );
  }
}

export async function assertCanTailor(userId: string) {
  const profile = await getUserPlan(userId);
  if (isPro(profile)) return;

  const month = currentMonth();
  const count =
    profile.tailor_usage_month === month ? profile.tailor_usage_count : 0;

  if (count >= 1) {
    throw new BillingError(
      "UPGRADE_REQUIRED",
      "Free plan includes 1 CV generation per month. Upgrade for unlimited tailoring."
    );
  }
}

export async function recordTailorUsage(userId: string) {
  const profile = await getUserPlan(userId);
  if (isPro(profile)) return;

  const month = currentMonth();
  const count =
    profile.tailor_usage_month === month ? profile.tailor_usage_count : 0;

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({
      tailor_usage_month: month,
      tailor_usage_count: count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function setUserPro(userId: string, stripeCustomerId: string, subscriptionId: string) {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({
      plan: "pro",
      subscription_status: "active",
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function setUserFree(userId: string) {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({
      plan: "free",
      subscription_status: "canceled",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export function billingErrorResponse(err: unknown) {
  if (err instanceof BillingError) {
    return Response.json(
      { error: err.message, code: err.code },
      { status: err.code === "UPGRADE_REQUIRED" ? 402 : 401 }
    );
  }
  const message = err instanceof Error ? err.message : "Request failed";
  return Response.json({ error: message }, { status: 500 });
}

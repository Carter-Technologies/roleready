import { setUserFree, setUserPro } from "./billing";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { getStripe } from "./stripe";

export type SyncSubscriptionResult = {
  plan: "free" | "pro";
  subscriptionStatus: string | null;
};

export async function syncUserSubscription(userId: string): Promise<SyncSubscriptionResult> {
  const admin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, email")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id as string | null | undefined;

  if (!customerId) {
    const search = await stripe.customers.search({
      query: `metadata['supabase_user_id']:'${userId}'`,
      limit: 1,
    });
    if (search.data[0]) {
      customerId = search.data[0].id;
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }
  }

  if (!customerId) {
    return { plan: "free", subscriptionStatus: null };
  }

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
  if (active) {
    const cid = typeof active.customer === "string" ? active.customer : active.customer.id;
    await setUserPro(userId, cid, active.id);
    return { plan: "pro", subscriptionStatus: "active" };
  }

  if (profile?.stripe_subscription_id) {
    await setUserFree(userId);
    return { plan: "free", subscriptionStatus: "canceled" };
  }

  return { plan: "free", subscriptionStatus: null };
}

import { getSupabaseAdmin } from "./supabaseAdmin";
import { getStripe } from "./stripe";

async function cancelStripeBilling(
  stripeCustomerId: string | null | undefined,
  stripeSubscriptionId: string | null | undefined
) {
  const stripe = getStripe();

  if (stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (err) {
      console.warn("delete-account: subscription cancel failed", err);
    }
  }

  if (!stripeCustomerId) return;

  try {
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
    });
    for (const sub of subs.data) {
      await stripe.subscriptions.cancel(sub.id);
    }
  } catch (err) {
    console.warn("delete-account: list/cancel subscriptions failed", err);
  }
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  await cancelStripeBilling(
    profile?.stripe_customer_id as string | null | undefined,
    profile?.stripe_subscription_id as string | null | undefined
  );

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}

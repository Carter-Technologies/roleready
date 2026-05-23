import { getUserFromRequest } from "./_lib/auth";
import { BillingError, billingErrorResponse } from "./_lib/billing";
import { getSupabaseAdmin } from "./_lib/supabaseAdmin";
import { getStripe } from "./_lib/stripe";

export const config = {
  runtime: "edge",
};

function getOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return process.env.VITE_APP_URL || "https://roleready.vercel.app";
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) throw new BillingError("UNAUTHORIZED", "Sign in required");

    const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
    if (!priceId) throw new Error("STRIPE_PRICE_ID_PRO_MONTHLY is not configured");
    if (priceId.startsWith("prod_")) {
      throw new Error(
        "STRIPE_PRICE_ID_PRO_MONTHLY must be a Price ID (price_...), not a Product ID (prod_...). In Stripe: Product → Pricing → copy the Price ID."
      );
    }

    const stripe = getStripe();
    const admin = getSupabaseAdmin();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(
        profileError.message.includes("stripe_customer_id")
          ? "Billing columns missing — run supabase/migrations/004_billing.sql"
          : profileError.message
      );
    }

    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || (profile?.email as string | undefined),
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      const { error: updateError } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (updateError) throw new Error(updateError.message);
    }

    const origin = getOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session:", err);
    return billingErrorResponse(err);
  }
}

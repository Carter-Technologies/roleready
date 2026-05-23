import Stripe from "stripe";
import { getUserFromRequest } from "./_lib/auth";
import { BillingError, billingErrorResponse } from "./_lib/billing";
import { getSupabaseAdmin } from "./_lib/supabaseAdmin";

export const config = {
  runtime: "nodejs",
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

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

    const stripe = getStripe();
    const admin = getSupabaseAdmin();

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || (profile?.email as string | undefined),
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
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
    return billingErrorResponse(err);
  }
}

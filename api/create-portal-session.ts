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

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) throw new BillingError("UNAUTHORIZED", "Sign in required");

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const customerId = profile?.stripe_customer_id as string | undefined;
    if (!customerId) {
      throw new BillingError("UPGRADE_REQUIRED", "No billing account found. Subscribe first.");
    }

    const origin = request.headers.get("origin") || process.env.VITE_APP_URL || "https://roleready.vercel.app";
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return billingErrorResponse(err);
  }
}

import { getUserFromRequest } from "./_lib/auth";
import { BillingError, billingErrorResponse } from "./_lib/billing";
import { getSupabaseAdmin } from "./_lib/supabaseAdmin";
import { getStripe } from "./_lib/stripe";
import { isSiteLocked, siteLockedResponse } from "./_lib/siteLock";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (isSiteLocked()) return siteLockedResponse();

  try {
    const user = await getUserFromRequest(request);
    if (!user) throw new BillingError("UNAUTHORIZED", "Sign in required");

    const admin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    const customerId = profile?.stripe_customer_id as string | undefined;
    if (!customerId) {
      throw new BillingError("UPGRADE_REQUIRED", "No billing account found. Subscribe first.");
    }

    const origin =
      request.headers.get("origin") || process.env.VITE_APP_URL || "https://www.kigho.com";
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("create-portal-session:", err);
    return billingErrorResponse(err);
  }
}

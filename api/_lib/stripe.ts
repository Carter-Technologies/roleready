import Stripe from "stripe";

/** Stripe client for Vercel Edge (Node routes fail with FUNCTION_INVOCATION_FAILED on this project). */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}

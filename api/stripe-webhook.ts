import type Stripe from "stripe";
import { setUserFree, setUserPro } from "./_lib/billing";
import { getStripe } from "./_lib/stripe";

export const config = {
  runtime: "edge",
};

async function resolveUserId(
  stripe: ReturnType<typeof getStripe>,
  metadata: Stripe.Metadata | null,
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null
) {
  if (metadata?.supabase_user_id) return metadata.supabase_user_id;

  if (typeof customerId === "string") {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id;
    }
  }

  return null;
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const rawBody = await request.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = await resolveUserId(stripe, session.metadata, session.customer);
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (userId && subId) {
          const customerId =
            typeof session.customer === "string" ? session.customer : session.customer?.id;
          if (customerId) await setUserPro(userId, customerId, subId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripe, sub.metadata, sub.customer);
        if (!userId) break;

        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        if (sub.status === "active" || sub.status === "trialing") {
          await setUserPro(userId, customerId, sub.id);
        } else if (sub.status === "canceled" || sub.status === "unpaid") {
          await setUserFree(userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripe, sub.metadata, sub.customer);
        if (userId) await setUserFree(userId);
        break;
      }

      default:
        break;
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    const message = err instanceof Error ? err.message : "Webhook error";
    return Response.json({ error: message }, { status: 400 });
  }
}

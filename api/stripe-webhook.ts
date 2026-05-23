import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { setUserFree, setUserPro } from "./_lib/billing";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function resolveUserId(
  stripe: Stripe,
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: "STRIPE_WEBHOOK_SECRET not configured" });
  }

  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    return res.status(400).json({ error: "Missing stripe-signature" });
  }

  try {
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

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

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    const message = err instanceof Error ? err.message : "Webhook error";
    return res.status(400).json({ error: message });
  }
}

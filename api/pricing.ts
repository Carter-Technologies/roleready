import { getStripe } from "./_lib/stripe";
import { isSiteLocked, siteLockedResponse } from "./_lib/siteLock";

export const config = {
  runtime: "edge",
};

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = currency.toLowerCase() === "eur" ? "€" : `${currency.toUpperCase()} `;
    return `${symbol}${amount}`;
  }
}

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (isSiteLocked()) return siteLockedResponse();

  try {
    const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim().replace(/^["']|["']$/g, "");
    if (!priceId?.startsWith("price_")) {
      throw new Error("STRIPE_PRICE_ID_PRO_MONTHLY is not configured");
    }

    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId);

    if (price.unit_amount == null) {
      throw new Error("Price has no unit amount");
    }

    const amount = price.unit_amount / 100;
    const currency = price.currency;
    const interval = price.recurring?.interval ?? "month";

    return Response.json(
      {
        amount,
        currency,
        interval,
        formatted: formatPrice(amount, currency),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("pricing:", err);
    const message = err instanceof Error ? err.message : "Failed to load pricing";
    return Response.json({ error: message }, { status: 500 });
  }
}

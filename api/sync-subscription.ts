import { getUserFromRequest } from "./_lib/auth";
import { BillingError, billingErrorResponse } from "./_lib/billing";
import { syncUserSubscription } from "./_lib/syncSubscription";
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

    const result = await syncUserSubscription(user.id);
    return Response.json(result);
  } catch (err) {
    console.error("sync-subscription:", err);
    return billingErrorResponse(err);
  }
}

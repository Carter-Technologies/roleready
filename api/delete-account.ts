import { getUserFromRequest } from "./_lib/auth";
import { BillingError, billingErrorResponse } from "./_lib/billing";
import { deleteUserAccount } from "./_lib/deleteAccount";
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

    const body = (await request.json()) as { confirm?: string };
    if (body.confirm !== "DELETE") {
      return Response.json({ error: 'Type "DELETE" to confirm account deletion' }, { status: 400 });
    }

    await deleteUserAccount(user.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete-account:", err);
    return billingErrorResponse(err);
  }
}

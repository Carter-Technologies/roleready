import { getUserFromRequest } from "./auth";
import { BillingError, billingErrorResponse } from "./billing";
import { isSiteLocked, siteLockedResponse } from "./siteLock";

export async function requireAuth(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new BillingError("UNAUTHORIZED", "Sign in required");
  }
  return user;
}

export async function handleApiAuth<T>(
  request: Request,
  handler: (userId: string) => Promise<T>
): Promise<Response> {
  try {
    if (isSiteLocked()) return siteLockedResponse();

    const user = await requireAuth(request);
    const result = await handler(user.id);
    return result instanceof Response ? result : Response.json(result);
  } catch (err) {
    if (err instanceof BillingError) return billingErrorResponse(err);
    const message = err instanceof Error ? err.message : "Request failed";
    const status = message.includes("required") ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

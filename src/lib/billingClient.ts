import { apiPost } from "./apiClient";

export async function startCheckout(): Promise<string> {
  const data = await apiPost<{ url: string }>("/api/create-checkout-session", {});
  return data.url;
}

export async function openBillingPortal(): Promise<string> {
  const data = await apiPost<{ url: string }>("/api/create-portal-session", {});
  return data.url;
}

export async function syncSubscription(): Promise<{ plan: "free" | "pro"; subscriptionStatus: string | null }> {
  return apiPost<{ plan: "free" | "pro"; subscriptionStatus: string | null }>(
    "/api/sync-subscription",
    {}
  );
}

export type ProPricing = {
  amount: number;
  currency: string;
  interval: string;
  formatted: string;
};

export async function fetchProPricing(): Promise<ProPricing> {
  const response = await fetch("/api/pricing");
  const data = (await response.json()) as ProPricing & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Failed to load pricing");
  }

  return data;
}

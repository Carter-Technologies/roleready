import type { AtsAnalysis } from "./types";

export async function analyzeAts(cv: string, jobDesc: string): Promise<AtsAnalysis> {
  const response = await fetch("/api/analyze-ats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cv, jobDesc }),
  });

  const data = (await response.json()) as { analysis?: AtsAnalysis; error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Failed to analyze application");
  }

  if (!data.analysis) {
    throw new Error("No analysis returned");
  }

  return data.analysis;
}

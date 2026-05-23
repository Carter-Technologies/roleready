import type { AtsAnalysis } from "./types";
import { apiPost } from "./apiClient";

export async function analyzeAts(cv: string, jobDesc: string): Promise<AtsAnalysis> {
  const data = await apiPost<{ analysis: AtsAnalysis }>("/api/analyze-ats", { cv, jobDesc });

  if (!data.analysis) {
    throw new Error("No analysis returned");
  }

  return data.analysis;
}

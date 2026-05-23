import { apiPost } from "./apiClient";

export async function generateCV(cv: string, jobDesc: string) {
  const data = await apiPost<{ result: string }>("/api/generate", { cv, jobDesc });
  return data.result;
}

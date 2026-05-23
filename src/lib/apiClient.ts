import { supabase } from "./supabase";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (data.session?.access_token) {
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T & { error?: string; code?: string };

  if (!response.ok) {
    const err = new Error(data.error || "Request failed") as Error & { code?: string };
    err.code = data.code;
    throw err;
  }

  return data;
}

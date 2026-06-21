import { apiPost } from "./apiClient";

export async function deleteAccount(): Promise<void> {
  await apiPost<{ ok: boolean }>("/api/delete-account", { confirm: "DELETE" });
}

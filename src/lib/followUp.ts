import type { FollowUpDraft } from "./types";

export async function fetchFollowUpDraft(input: {
  cv: string;
  jobDesc: string;
  company: string;
  roleTitle: string;
  notes?: string;
}): Promise<FollowUpDraft> {
  const response = await fetch("/api/draft-follow-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as { draft?: FollowUpDraft; error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Failed to draft follow-up");
  }

  if (!data.draft) {
    throw new Error("No follow-up draft returned");
  }

  return data.draft;
}

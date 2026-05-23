import type { FollowUpDraft } from "./types";
import { apiPost } from "./apiClient";

export async function fetchFollowUpDraft(input: {
  cv: string;
  jobDesc: string;
  company: string;
  roleTitle: string;
  notes?: string;
}): Promise<FollowUpDraft> {
  const data = await apiPost<{ draft: FollowUpDraft }>("/api/draft-follow-up", input);

  if (!data.draft) {
    throw new Error("No follow-up draft returned");
  }

  return data.draft;
}

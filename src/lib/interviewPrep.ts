import type { InterviewPrep } from "./types";
import { apiPost } from "./apiClient";

export async function fetchInterviewPrep(
  cv: string,
  jobDesc: string,
  company: string
): Promise<InterviewPrep> {
  const data = await apiPost<{ prep: InterviewPrep }>("/api/interview-prep", {
    cv,
    jobDesc,
    company,
  });

  if (!data.prep) {
    throw new Error("No interview prep returned");
  }

  return data.prep;
}

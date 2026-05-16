import type { InterviewPrep } from "./types";

export async function fetchInterviewPrep(
  cv: string,
  jobDesc: string,
  company: string
): Promise<InterviewPrep> {
  const response = await fetch("/api/interview-prep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cv, jobDesc, company }),
  });

  const data = (await response.json()) as { prep?: InterviewPrep; error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate interview prep");
  }

  if (!data.prep) {
    throw new Error("No interview prep returned");
  }

  return data.prep;
}

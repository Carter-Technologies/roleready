import type { SplitResult } from "./types";

export function splitAIResult(result: string): SplitResult {
  const cvMatch = result.match(/TAILORED CV:\s*([\s\S]*?)COVER LETTER:/i);
  const coverLetterMatch = result.match(/COVER LETTER:\s*([\s\S]*)/i);

  return {
    tailoredCV: cvMatch?.[1]?.trim() || result,
    coverLetter: coverLetterMatch?.[1]?.trim() || "",
  };
}

export function guessJobTitle(jobDesc: string): string {
  const lines = jobDesc
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const titleLine =
    lines.find((l) => /engineer|developer|manager|analyst|designer|lead|role/i.test(l)) ||
    lines[0];

  return titleLine?.slice(0, 120) || "Untitled role";
}

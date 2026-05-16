import type { SplitResult } from "./types";

export function splitAIResult(result: string): SplitResult {
  const cvMatch = result.match(/TAILORED CV:\s*([\s\S]*?)COVER LETTER:/i);
  const coverLetterMatch = result.match(/COVER LETTER:\s*([\s\S]*)/i);

  return {
    tailoredCV: cvMatch?.[1]?.trim() || result,
    coverLetter: coverLetterMatch?.[1]?.trim() || "",
  };
}

export { guessJobTitle, parseJobDescription } from "./jobMeta";

export type InterviewPrepResult = {
  questions: { question: string; category: string; tips: string }[];
  starAnswers: {
    question: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
  questionsToAsk: string[];
  focusAreas: string[];
  elevatorPitch: string;
};

const SYSTEM_PROMPT = `You are an expert interview coach.

Given a CV and job description, produce interview preparation as JSON only (no markdown).

Schema:
{
  "questions": [{ "question": "<likely question>", "category": "behavioral|technical|general", "tips": "<short prep tip>" }],
  "starAnswers": [{ "question": "<question>", "situation": "", "task": "", "action": "", "result": "" }],
  "questionsToAsk": ["<question candidate should ask interviewer>"],
  "focusAreas": ["<weak areas to rehearse>"],
  "elevatorPitch": "<30-second intro based on CV>"
}

Rules:
- questions: 8-12 items
- starAnswers: 4-6 items mapped to their CV (do not invent employers)
- questionsToAsk: 4-6 items
- focusAreas: 3-6 items
- Base everything on provided CV and JD only`;

function normalizePrep(raw: unknown): InterviewPrepResult {
  const o = raw as Record<string, unknown>;
  const questions = Array.isArray(o.questions) ? o.questions : [];
  const starAnswers = Array.isArray(o.starAnswers) ? o.starAnswers : [];

  return {
    questions: questions
      .map((item) => {
        const q = item as Record<string, unknown>;
        return {
          question: String(q.question ?? ""),
          category: String(q.category ?? "general"),
          tips: String(q.tips ?? ""),
        };
      })
      .filter((q) => q.question),
    starAnswers: starAnswers
      .map((item) => {
        const s = item as Record<string, unknown>;
        return {
          question: String(s.question ?? ""),
          situation: String(s.situation ?? ""),
          task: String(s.task ?? ""),
          action: String(s.action ?? ""),
          result: String(s.result ?? ""),
        };
      })
      .filter((s) => s.question),
    questionsToAsk: Array.isArray(o.questionsToAsk)
      ? o.questionsToAsk.map(String).filter(Boolean)
      : [],
    focusAreas: Array.isArray(o.focusAreas) ? o.focusAreas.map(String).filter(Boolean) : [],
    elevatorPitch: String(o.elevatorPitch ?? ""),
  };
}

export async function generateInterviewPrep(
  cv: string,
  jobDesc: string,
  company: string,
  apiKey: string
): Promise<InterviewPrepResult> {
  if (!cv?.trim() || !jobDesc?.trim()) {
    throw new Error("CV and job description are required");
  }

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://roleready.vercel.app",
      "X-Title": "RoleReady",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Company: ${company || "Unknown"}\n\nCV:\n${cv}\n\nJOB DESCRIPTION:\n${jobDesc}`,
        },
      ],
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter request failed");
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No interview prep returned from AI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Invalid interview prep response format");
  }

  return normalizePrep(parsed);
}

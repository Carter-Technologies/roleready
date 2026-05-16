export type AtsAnalysisResult = {
  score: number;
  keywordScoring: {
    matchPercentage: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  atsOptimisation: string[];
  missingSkills: { skill: string; importance: "high" | "medium" | "low"; suggestion: string }[];
  resumeFeedback: string[];
};

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and CV analyst.

Analyze the candidate CV against the job description.

Return ONLY valid JSON (no markdown) matching this exact schema:
{
  "score": <number 0-100, overall fit for the role>,
  "keywordScoring": {
    "matchPercentage": <number 0-100>,
    "matchedKeywords": [<important keywords/skills/tools from JD that appear in CV>],
    "missingKeywords": [<important keywords from JD NOT clearly in CV>]
  },
  "atsOptimisation": [<3-6 short actionable tips for ATS parsing and ranking>],
  "missingSkills": [
    { "skill": "<skill>", "importance": "high"|"medium"|"low", "suggestion": "<how to address>" }
  ],
  "resumeFeedback": [<3-6 specific resume quality improvements: bullets, metrics, clarity>]
}

Rules:
- Base analysis only on provided text. Do not invent experience.
- matchedKeywords and missingKeywords: 5-12 items each, concise (1-4 words each).
- missingSkills: 3-8 items, prioritize JD requirements.
- Be honest; average applicants often score 40-70.`;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeImportance(value: unknown): "high" | "medium" | "low" {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function normalizeAnalysis(raw: unknown): AtsAnalysisResult {
  const o = raw as Record<string, unknown>;
  const ks = (o.keywordScoring ?? {}) as Record<string, unknown>;
  const missingSkills = Array.isArray(o.missingSkills) ? o.missingSkills : [];

  return {
    score: clamp(Number(o.score) || 0, 0, 100),
    keywordScoring: {
      matchPercentage: clamp(Number(ks.matchPercentage) || Number(o.score) || 0, 0, 100),
      matchedKeywords: Array.isArray(ks.matchedKeywords)
        ? ks.matchedKeywords.map(String).filter(Boolean)
        : [],
      missingKeywords: Array.isArray(ks.missingKeywords)
        ? ks.missingKeywords.map(String).filter(Boolean)
        : [],
    },
    atsOptimisation: Array.isArray(o.atsOptimisation)
      ? o.atsOptimisation.map(String).filter(Boolean)
      : [],
    missingSkills: missingSkills
      .map((item) => {
        const s = item as Record<string, unknown>;
        return {
          skill: String(s.skill ?? ""),
          importance: normalizeImportance(s.importance),
          suggestion: String(s.suggestion ?? ""),
        };
      })
      .filter((s) => s.skill),
    resumeFeedback: Array.isArray(o.resumeFeedback)
      ? o.resumeFeedback.map(String).filter(Boolean)
      : [],
  };
}

export async function analyzeAts(
  cv: string,
  jobDesc: string,
  apiKey: string
): Promise<AtsAnalysisResult> {
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
          content: `CV:\n${cv}\n\nJOB DESCRIPTION:\n${jobDesc}`,
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
    throw new Error("No analysis returned from AI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Invalid analysis response format");
  }

  return normalizeAnalysis(parsed);
}

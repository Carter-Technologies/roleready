import { APP_NAME, APP_URL } from "./appMeta";
import { applyIrishSpelling } from "./irishSpelling";

export async function generateTailoredCv(
  cv: string,
  jobDesc: string,
  apiKey: string
): Promise<string> {
  if (!cv || !jobDesc) {
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
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an expert CV and career strategist.

You will ALWAYS receive:
1. A CV
2. A Job Description

Your job:
- Rewrite the CV to match the job description
- Create a tailored cover letter

STRICT RULES:
- Use Irish English spelling throughout (e.g. organisation, colour, prioritise, specialise, centre, programme, labour, recognise, analyse, honour, travelled, behaviour). Never use American spellings.
- For each work experience role, include at least 3 bullet points when the source CV provides enough detail. Use every relevant achievement from the source; split long points if needed. Never invent achievements.
- Do NOT ask for more information
- Do NOT include placeholder text
- Do NOT write instructions like "write here"
- Do NOT explain anything
- ONLY return the final result

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

TAILORED CV:
Provide the complete, fully rewritten CV.

COVER LETTER:
Provide a complete, professional cover letter tailored to the role.
`,
        },
        {
          role: "user",
          content: `
CV:
${cv}

JOB DESCRIPTION:
${jobDesc}
`,
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

  const result = data.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error("No content returned from AI");
  }

  return applyIrishSpelling(result);
}

import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "RoleReady",
  },
});

export async function generateCV(cv: string, jobDesc: string) {
  const response = await client.chat.completions.create({
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
- Do NOT ask for more information
- Do NOT say "please provide"
- Do NOT explain what you will do
- ONLY return the final result

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

TAILORED CV:
[Write the full improved CV here]

COVER LETTER:
[Write the cover letter here]
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
  });

  return response.choices[0].message.content;
}
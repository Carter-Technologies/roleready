import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cv, jobDesc } = req.body;

    if (!cv || !jobDesc) {
      return res.status(400).json({
        error: "CV and job description are required",
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://roleready.vercel.app",
        "X-Title": "RoleReady",
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter request failed",
      });
    }

    const result = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Generate API error:", error);

    return res.status(500).json({
      error: "Something went wrong generating your CV.",
    });
  }
}
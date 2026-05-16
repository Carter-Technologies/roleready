export type FollowUpDraftResult = {
  subject: string;
  body: string;
};

export async function generateFollowUpDraft(
  cv: string,
  jobDesc: string,
  company: string,
  roleTitle: string,
  notes: string,
  apiKey: string
): Promise<FollowUpDraftResult> {
  if (!company?.trim() || !roleTitle?.trim()) {
    throw new Error("Company and role title are required");
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
        {
          role: "system",
          content: `Write a professional job application follow-up email as JSON: { "subject": "...", "body": "..." }.
Keep body under 200 words, warm and concise. No placeholder brackets.`,
        },
        {
          role: "user",
          content: `Company: ${company}\nRole: ${roleTitle}\nNotes: ${notes || "Applied recently"}\n\nCV excerpt:\n${cv.slice(0, 2000)}\n\nJob description excerpt:\n${jobDesc.slice(0, 1500)}`,
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
    throw new Error("No follow-up draft returned");
  }

  const parsed = JSON.parse(content) as { subject?: string; body?: string };
  return {
    subject: String(parsed.subject ?? `Following up — ${roleTitle}`),
    body: String(parsed.body ?? ""),
  };
}

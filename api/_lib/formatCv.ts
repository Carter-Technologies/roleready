import { APP_NAME, APP_URL } from "./appMeta";

export type FormattedCvExperience = {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
};

export type FormattedCvEducation = {
  degree: string;
  institution: string;
  dates?: string;
  details?: string;
};

export type FormattedCv = {
  name: string;
  headline?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: FormattedCvExperience[];
  education: FormattedCvEducation[];
  skills: string[];
  certifications?: string[];
};

const SYSTEM_PROMPT = `You are an expert CV formatter.

Convert the provided tailored CV text into structured JSON for a professional Word document.

Return ONLY valid JSON (no markdown) matching this schema:
{
  "name": "<full name>",
  "headline": "<optional professional headline>",
  "contact": {
    "email": "<optional>",
    "phone": "<optional>",
    "location": "<optional>",
    "linkedin": "<optional>",
    "website": "<optional>"
  },
  "summary": "<2-4 sentence professional summary>",
  "experience": [
    {
      "title": "<job title>",
      "company": "<company>",
      "location": "<optional>",
      "dates": "<date range>",
      "bullets": ["<achievement bullet>", "..."]
    }
  ],
  "education": [
    {
      "degree": "<degree / qualification>",
      "institution": "<school>",
      "dates": "<optional>",
      "details": "<optional honors, GPA, etc>"
    }
  ],
  "skills": ["<skill>", "..."],
  "certifications": ["<optional certification>"]
}

Rules:
- Preserve facts from the CV text only. Do not invent employers, dates, or credentials.
- Each experience entry should have 2-5 strong bullet points when available in the source.
- skills: 8-20 concise items.
- If a section is missing in the source, use an empty array (not null).
- name is required.`;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function normalizeFormattedCv(raw: unknown): FormattedCv {
  const o = raw as Record<string, unknown>;
  const contact = (o.contact ?? {}) as Record<string, unknown>;

  const experience = Array.isArray(o.experience)
    ? o.experience
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            title: asString(row.title),
            company: asString(row.company),
            location: asString(row.location) || undefined,
            dates: asString(row.dates),
            bullets: asStringArray(row.bullets),
          };
        })
        .filter((row) => row.title || row.company)
    : [];

  const education = Array.isArray(o.education)
    ? o.education
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            degree: asString(row.degree),
            institution: asString(row.institution),
            dates: asString(row.dates) || undefined,
            details: asString(row.details) || undefined,
          };
        })
        .filter((row) => row.degree || row.institution)
    : [];

  const name = asString(o.name) || "CV";

  return {
    name,
    headline: asString(o.headline) || undefined,
    contact: {
      email: asString(contact.email) || undefined,
      phone: asString(contact.phone) || undefined,
      location: asString(contact.location) || undefined,
      linkedin: asString(contact.linkedin) || undefined,
      website: asString(contact.website) || undefined,
    },
    summary: asString(o.summary) || undefined,
    experience,
    education,
    skills: asStringArray(o.skills),
    certifications: asStringArray(o.certifications),
  };
}

export async function structureTailoredCv(
  tailoredCv: string,
  apiKey: string,
  jobTitle?: string
): Promise<FormattedCv> {
  if (!tailoredCv?.trim()) {
    throw new Error("Tailored CV text is required");
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
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: jobTitle
            ? `TARGET ROLE: ${jobTitle}\n\nTAILORED CV:\n${tailoredCv}`
            : `TAILORED CV:\n${tailoredCv}`,
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
    throw new Error("No formatted CV returned from AI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Invalid formatted CV response");
  }

  return normalizeFormattedCv(parsed);
}

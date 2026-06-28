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

export type FormattedCvSkillGroup = {
  category: string;
  items: string[];
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
  skills: FormattedCvSkillGroup[];
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
  "skills": [
    {
      "category": "<capability area, e.g. Product ownership>",
      "items": ["<tool or method>", "<tool or method>"]
    }
  ],
  "certifications": ["<optional certification>"]
}

Rules:
- Preserve facts from the CV text only. Do not invent employers, dates, credentials, or achievements.
- experience: each role should have at least 3 bullet points when the source CV provides enough detail. Use fewer only if the source genuinely lacks content — never pad with invented achievements.
- Keep bullets concise (one line each). Prioritise the most recent and relevant roles.
- The formatted CV must fit within 2 pages when rendered in Word: use a 2-3 sentence summary, include the most recent roles first (typically 3-5 roles), and avoid overly long sections. Omit older or less relevant detail if needed to stay within 2 pages.
- skills: 4-8 groups. Each group has a category (capability or domain) and items (tools, methods, technologies, or techniques shown in the CV for that area). Example: category "Product ownership", items ["Jira", "Scrum", "Agile methodologies", "Requirements gathering"].
- Do not list skills as a flat array of single words. Group related items under a meaningful category from the CV.
- Do not include a references section in the JSON (it is added automatically).
- If a section is missing in the source, use an empty array (not null).
- name is required.`;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeSkills(value: unknown): FormattedCvSkillGroup[] {
  if (!Array.isArray(value) || value.length === 0) return [];

  if (typeof value[0] === "object" && value[0] !== null) {
    return value
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          category: asString(row.category),
          items: asStringArray(row.items),
        };
      })
      .filter((row) => row.category);
  }

  return asStringArray(value).map((entry) => {
    const colon = entry.indexOf(":");
    if (colon > 0) {
      return {
        category: entry.slice(0, colon).trim(),
        items: entry
          .slice(colon + 1)
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
      };
    }
    return { category: entry, items: [] };
  });
}

const MAX_EXPERIENCE_ROLES = 5;
const MAX_BULLETS_PER_ROLE = 4;
const MAX_SUMMARY_CHARS = 520;
const MAX_SKILL_GROUPS = 6;
const MAX_ITEMS_PER_SKILL = 6;

/** Trim content so typical Word render stays within ~2 pages. */
function trimForTwoPages(cv: FormattedCv): FormattedCv {
  let summary = cv.summary;
  if (summary && summary.length > MAX_SUMMARY_CHARS) {
    summary = `${summary.slice(0, MAX_SUMMARY_CHARS).replace(/\s+\S*$/, "")}…`;
  }

  return {
    ...cv,
    summary,
    experience: cv.experience.slice(0, MAX_EXPERIENCE_ROLES).map((role) => ({
      ...role,
      bullets: role.bullets.slice(0, MAX_BULLETS_PER_ROLE),
    })),
    education: cv.education.slice(0, 3),
    skills: cv.skills.slice(0, MAX_SKILL_GROUPS).map((group) => ({
      ...group,
      items: group.items.slice(0, MAX_ITEMS_PER_SKILL),
    })),
    certifications: cv.certifications?.slice(0, 4),
  };
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

  return trimForTwoPages({
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
    skills: normalizeSkills(o.skills),
    certifications: asStringArray(o.certifications),
  });
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

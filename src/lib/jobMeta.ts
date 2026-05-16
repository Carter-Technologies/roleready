export type JobMeta = {
  roleTitle: string;
  company: string;
  /** Primary label for lists, e.g. "Senior Engineer · Acme Corp" */
  displayTitle: string;
};

const ROLE_KEYWORDS =
  /\b(engineer|developer|designer|manager|analyst|architect|consultant|specialist|coordinator|director|lead|intern|scientist|administrator|associate|recruiter|product|marketing|sales|support|devops|sre|qa|tester)\b/i;

function cleanLine(line: string) {
  return line
    .replace(/^[\s#*•\-–—]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeRole(line: string) {
  const t = cleanLine(line);
  if (t.length < 3 || t.length > 100) return false;
  if (/^(about|description|requirements|responsibilities|qualifications|benefits|who we)/i.test(t))
    return false;
  return ROLE_KEYWORDS.test(t) || /^(senior|staff|lead|principal|junior|head of)\s/i.test(t);
}

function looksLikeCompany(line: string) {
  const t = cleanLine(line);
  if (t.length < 2 || t.length > 80) return false;
  if (ROLE_KEYWORDS.test(t) && t.split(" ").length > 4) return false;
  if (/\b(will|you|your|we|our|the role|responsibilities|requirements|apply)\b/i.test(t))
    return false;
  if (/^https?:\/\//i.test(t)) return false;
  return true;
}

function buildDisplay(role: string, company: string): string {
  if (role && company) return `${role} · ${company}`;
  return role || company || "Untitled application";
}

/** Parse role and company from a pasted job description. */
export function parseJobDescription(jobDesc: string): JobMeta {
  const lines = jobDesc
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  if (lines.length === 0) {
    return { roleTitle: "", company: "", displayTitle: "Untitled application" };
  }

  let role = "";
  let company = "";

  for (const line of lines.slice(0, 20)) {
    const atMatch = line.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
    if (atMatch && looksLikeRole(atMatch[1])) {
      role = atMatch[1].trim();
      company = atMatch[2].trim();
      break;
    }
  }

  if (!company) {
    for (const line of lines.slice(0, 25)) {
      const labelMatch = line.match(
        /^(?:company|employer|organization|hiring company|client)\s*[:|\-–]\s*(.+)$/i
      );
      if (labelMatch) {
        company = labelMatch[1].trim();
        break;
      }
    }
  }

  if (!role) {
    role =
      lines.find((l) => looksLikeRole(l)) ??
      lines.find((l) => l.length <= 80 && !looksLikeCompany(l)) ??
      lines[0];
    role = role.slice(0, 100);
  }

  if (!company) {
    const roleIndex = lines.findIndex((l) => l === role || l.includes(role.slice(0, 30)));
    const candidates = [
      roleIndex >= 0 ? lines[roleIndex + 1] : undefined,
      lines[1],
      lines.find((l, i) => i > 0 && looksLikeCompany(l) && l !== role),
    ].filter(Boolean) as string[];

    for (const c of candidates) {
      if (looksLikeCompany(c) && c !== role) {
        company = c.slice(0, 80);
        break;
      }
    }
  }

  role = role.slice(0, 100);
  company = company.slice(0, 80);

  return {
    roleTitle: role,
    company,
    displayTitle: buildDisplay(role, company),
  };
}

/** Label for a history row (re-parses JD for older saves with weak titles). */
export function getGenerationDisplay(item: {
  job_title: string | null;
  job_description: string;
  created_at: string;
}): { title: string; subtitle: string } {
  const stored = item.job_title?.trim() ?? "";
  const hasRichTitle = stored.includes("·") || /\s+at\s+/i.test(stored);

  let meta: JobMeta;
  if (hasRichTitle && stored.length > 8) {
    const parts = stored.includes("·")
      ? stored.split("·").map((p) => p.trim())
      : stored.split(/\s+at\s+/i).map((p) => p.trim());
    meta = {
      roleTitle: parts[0] ?? stored,
      company: parts[1] ?? "",
      displayTitle: stored,
    };
  } else {
    meta = parseJobDescription(item.job_description);
    if (stored && stored !== "Untitled role" && meta.displayTitle === "Untitled application") {
      meta.roleTitle = stored;
      meta.displayTitle = buildDisplay(stored, meta.company);
    } else if (stored && !meta.roleTitle) {
      meta.roleTitle = stored;
      meta.displayTitle = buildDisplay(stored, meta.company);
    }
  }

  const date = new Date(item.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subtitleParts: string[] = [date];
  if (meta.company && !meta.displayTitle.includes(meta.company)) {
    subtitleParts.push(meta.company);
  } else if (meta.roleTitle && meta.displayTitle !== meta.roleTitle) {
    subtitleParts.push(meta.roleTitle);
  }

  return {
    title: meta.displayTitle,
    subtitle: subtitleParts.join(" · "),
  };
}

/** @deprecated Use parseJobDescription().roleTitle */
export function guessJobTitle(jobDesc: string): string {
  return parseJobDescription(jobDesc).roleTitle || "Untitled role";
}

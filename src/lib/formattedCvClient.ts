import { apiPost } from "./apiClient";
import { buildFormattedCvDocx, formattedCvFilename } from "./cvTemplate";
import type { FormattedCv } from "./formattedCvTypes";

type FormatCvResponse = {
  formatted: FormattedCv;
};

export async function structureFormattedCv(
  tailoredCv: string,
  jobTitle?: string
): Promise<FormattedCv> {
  const data = await apiPost<FormatCvResponse>("/api/format-cv", {
    tailoredCv,
    jobTitle,
  });
  return data.formatted;
}

export async function downloadFormattedCvDocx(
  tailoredCv: string,
  options: { slug: string; jobTitle?: string }
): Promise<void> {
  const formatted = await structureFormattedCv(tailoredCv, options.jobTitle);
  const blob = await buildFormattedCvDocx(formatted);
  const filename = formattedCvFilename(options.slug, formatted.name);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

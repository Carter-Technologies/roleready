import { getPdfJs } from "./pdfJsBrowser";

function cleanExtractedText(text: string): string {
  const cleaned = text.trim();
  if (!cleaned) {
    throw new Error("No text found in PDF. Try a text-based PDF or paste your CV manually.");
  }
  return cleaned;
}

/** Parse PDF in the browser. */
export async function extractTextFromPdf(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.type !== "application/pdf" && !name.endsWith(".pdf")) {
    throw new Error("Please upload a PDF file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDF must be under 10MB.");
  }

  const pdfjs = await getPdfJs();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const doc = await pdfjs.getDocument({
    data: bytes,
    useSystemFonts: true,
    isEvalSupported: false,
    disableFontFace: false,
  }).promise;

  try {
    const parts: string[] = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item && item.str ? item.str : ""))
        .filter(Boolean)
        .join(" ");
      if (pageText) parts.push(pageText);
    }
    return cleanExtractedText(parts.join("\n\n"));
  } finally {
    void doc.destroy();
  }
}

export async function parseCvFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractTextFromPdf(file);
  }

  if (name.endsWith(".txt") || file.type === "text/plain") {
    return file.text();
  }

  throw new Error("Supported formats: PDF or TXT");
}

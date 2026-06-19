function cleanExtractedText(text: string | string[]): string {
  const cleaned = (Array.isArray(text) ? text.join("\n\n") : String(text)).trim();
  if (!cleaned) {
    throw new Error("No text found in PDF. Try a text-based PDF or paste your CV manually.");
  }
  return cleaned;
}

/** Parse PDF in the browser — avoids Edge/serverless PDF.js issues on Vercel. */
export async function extractTextFromPdf(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.type !== "application/pdf" && !name.endsWith(".pdf")) {
    throw new Error("Please upload a PDF file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDF must be under 10MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return cleanExtractedText(text);
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

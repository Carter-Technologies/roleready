export async function parsePdfFromBase64(pdfBase64: string): Promise<string> {
  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    throw new Error("pdfBase64 is required");
  }

  const buffer = Buffer.from(pdfBase64, "base64");

  if (buffer.length === 0) {
    throw new Error("Invalid PDF data");
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error("PDF must be under 10MB");
  }

  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const cleaned = (Array.isArray(text) ? text.join("\n\n") : String(text)).trim();

  if (!cleaned) {
    throw new Error("No text found in PDF. Try a text-based PDF or paste your CV manually.");
  }

  return cleaned;
}

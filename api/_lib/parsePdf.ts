function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function parsePdfFromBase64(pdfBase64: string): Promise<string> {
  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    throw new Error("pdfBase64 is required");
  }

  let bytes: Uint8Array;
  try {
    bytes = base64ToUint8Array(pdfBase64);
  } catch {
    throw new Error("Invalid PDF data");
  }

  if (bytes.length === 0) {
    throw new Error("Invalid PDF data");
  }

  if (bytes.length > 10 * 1024 * 1024) {
    throw new Error("PDF must be under 10MB");
  }

  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });

  const cleaned = (Array.isArray(text) ? text.join("\n\n") : String(text)).trim();

  if (!cleaned) {
    throw new Error("No text found in PDF. Try a text-based PDF or paste your CV manually.");
  }

  return cleaned;
}

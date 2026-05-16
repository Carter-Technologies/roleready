import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pdfBase64 } = req.body as { pdfBase64?: string };

    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return res.status(400).json({ error: "pdfBase64 is required" });
    }

    const buffer = Buffer.from(pdfBase64, "base64");

    if (buffer.length === 0) {
      return res.status(400).json({ error: "Invalid PDF data" });
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "PDF must be under 10MB" });
    }

    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });

    const cleaned = (Array.isArray(text) ? text.join("\n\n") : String(text)).trim();

    if (!cleaned) {
      return res.status(422).json({
        error: "No text found in PDF. Try a text-based PDF or paste your CV manually.",
      });
    }

    return res.status(200).json({ text: cleaned });
  } catch (error) {
    console.error("Parse CV error:", error);
    return res.status(500).json({ error: "Failed to parse PDF" });
  }
}

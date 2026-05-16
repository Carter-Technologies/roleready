import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parsePdfFromBase64 } from "./_lib/parsePdf";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pdfBase64 } = req.body as { pdfBase64?: string };
    const text = await parsePdfFromBase64(pdfBase64 ?? "");
    return res.status(200).json({ text });
  } catch (error) {
    console.error("Parse CV error:", error);
    const message = error instanceof Error ? error.message : "Failed to parse PDF";
    const status = message.includes("No text found") ? 422 : message.includes("required") || message.includes("Invalid") || message.includes("10MB") ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}

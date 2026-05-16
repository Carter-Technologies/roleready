import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateTailoredCv } from "./_lib/generate";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cv, jobDesc } = req.body;
    const result = await generateTailoredCv(
      cv,
      jobDesc,
      process.env.OPENROUTER_API_KEY ?? ""
    );
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Generate API error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong generating your CV.";
    const status = message.includes("required") ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}

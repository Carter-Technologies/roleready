import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeAts } from "../server/analyzeAts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cv, jobDesc } = req.body;
    const analysis = await analyzeAts(cv, jobDesc, process.env.OPENROUTER_API_KEY ?? "");
    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("Analyze ATS error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    const status = message.includes("required") ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}

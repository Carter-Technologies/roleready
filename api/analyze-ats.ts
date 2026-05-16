import { analyzeAts } from "./_lib/analyzeAts";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as { cv?: string; jobDesc?: string };
    const analysis = await analyzeAts(
      body.cv ?? "",
      body.jobDesc ?? "",
      process.env.OPENROUTER_API_KEY ?? ""
    );
    return Response.json({ analysis });
  } catch (error) {
    console.error("Analyze ATS error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    const status = message.includes("required") ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

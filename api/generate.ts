import { generateTailoredCv } from "./_lib/generate";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as { cv?: string; jobDesc?: string };
    const result = await generateTailoredCv(
      body.cv ?? "",
      body.jobDesc ?? "",
      process.env.OPENROUTER_API_KEY ?? ""
    );
    return Response.json({ result });
  } catch (error) {
    console.error("Generate API error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong generating your CV.";
    const status = message.includes("required") ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

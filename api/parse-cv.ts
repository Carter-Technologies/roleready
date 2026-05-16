import { parsePdfFromBase64 } from "./_lib/parsePdf";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as { pdfBase64?: string };
    const text = await parsePdfFromBase64(body.pdfBase64 ?? "");
    return Response.json({ text });
  } catch (error) {
    console.error("Parse CV error:", error);
    const message = error instanceof Error ? error.message : "Failed to parse PDF";
    const status = message.includes("No text found")
      ? 422
      : message.includes("required") ||
          message.includes("Invalid") ||
          message.includes("10MB")
        ? 400
        : 500;
    return Response.json({ error: message }, { status });
  }
}

import { generateFollowUpDraft } from "./_lib/followUpDraft";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as {
      cv?: string;
      jobDesc?: string;
      company?: string;
      roleTitle?: string;
      notes?: string;
    };
    const draft = await generateFollowUpDraft(
      body.cv ?? "",
      body.jobDesc ?? "",
      body.company ?? "",
      body.roleTitle ?? "",
      body.notes ?? "",
      process.env.OPENROUTER_API_KEY ?? ""
    );
    return Response.json({ draft });
  } catch (error) {
    console.error("Follow-up draft error:", error);
    const message = error instanceof Error ? error.message : "Follow-up draft failed";
    const status = message.includes("required") ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

import { generateInterviewPrep } from "./_lib/interviewPrep";

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
    };
    const prep = await generateInterviewPrep(
      body.cv ?? "",
      body.jobDesc ?? "",
      body.company ?? "",
      process.env.OPENROUTER_API_KEY ?? ""
    );
    return Response.json({ prep });
  } catch (error) {
    console.error("Interview prep error:", error);
    const message = error instanceof Error ? error.message : "Interview prep failed";
    const status = message.includes("required") ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

import { analyzeAts } from "./_lib/analyzeAts";
import { assertProFeature } from "./_lib/billing";
import { handleApiAuth } from "./_lib/withAuth";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  return handleApiAuth(request, async (userId) => {
    await assertProFeature(userId, "ATS analysis");

    const body = (await request.json()) as { cv?: string; jobDesc?: string };
    const analysis = await analyzeAts(
      body.cv ?? "",
      body.jobDesc ?? "",
      process.env.OPENROUTER_API_KEY ?? ""
    );
    return { analysis };
  });
}

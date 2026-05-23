import { generateTailoredCv } from "./_lib/generate";
import { assertCanTailor, recordTailorUsage } from "./_lib/billing";
import { handleApiAuth } from "./_lib/withAuth";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  return handleApiAuth(request, async (userId) => {
    const body = (await request.json()) as { cv?: string; jobDesc?: string };

    await assertCanTailor(userId);

    const result = await generateTailoredCv(
      body.cv ?? "",
      body.jobDesc ?? "",
      process.env.OPENROUTER_API_KEY ?? ""
    );

    await recordTailorUsage(userId);

    return { result };
  });
}

import { assertProFeature } from "./_lib/billing";
import { structureTailoredCv } from "./_lib/formatCv";
import { handleApiAuth } from "./_lib/withAuth";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  return handleApiAuth(request, async (userId) => {
    await assertProFeature(userId, "Formatted CV export");

    const body = (await request.json()) as { tailoredCv?: string; jobTitle?: string };
    const formatted = await structureTailoredCv(
      body.tailoredCv ?? "",
      process.env.OPENROUTER_API_KEY ?? "",
      body.jobTitle
    );

    return { formatted };
  });
}

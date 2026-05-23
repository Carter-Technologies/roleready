import { generateFollowUpDraft } from "./_lib/followUpDraft";
import { assertProFeature } from "./_lib/billing";
import { handleApiAuth } from "./_lib/withAuth";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  return handleApiAuth(request, async (userId) => {
    await assertProFeature(userId, "Follow-up drafts");

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
    return { draft };
  });
}

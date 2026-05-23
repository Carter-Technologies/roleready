import { generateInterviewPrep } from "./_lib/interviewPrep";
import { assertProFeature } from "./_lib/billing";
import { handleApiAuth } from "./_lib/withAuth";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  return handleApiAuth(request, async (userId) => {
    await assertProFeature(userId, "Interview prep");

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
    return { prep };
  });
}

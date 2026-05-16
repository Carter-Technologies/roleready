import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { analyzeAts } from "./api/_lib/analyzeAts";
import { generateFollowUpDraft } from "./api/_lib/followUpDraft";
import { generateTailoredCv } from "./api/_lib/generate";
import { generateInterviewPrep } from "./api/_lib/interviewPrep";
import { parsePdfFromBase64 } from "./api/_lib/parsePdf";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

const API_ROUTES = new Set([
  "/api/parse-cv",
  "/api/generate",
  "/api/analyze-ats",
  "/api/interview-prep",
  "/api/draft-follow-up",
]);

export function apiDevPlugin(): Plugin {
  return {
    name: "roleready-api-dev",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      const apiKey = () => env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "";

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];

        if (!url || !API_ROUTES.has(url)) {
          return next();
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = (await readJsonBody(req)) as Record<string, string>;

          if (url === "/api/parse-cv") {
            const text = await parsePdfFromBase64(body.pdfBase64);
            sendJson(res, 200, { text });
            return;
          }

          if (url === "/api/analyze-ats") {
            const analysis = await analyzeAts(body.cv, body.jobDesc, apiKey());
            sendJson(res, 200, { analysis });
            return;
          }

          if (url === "/api/interview-prep") {
            const prep = await generateInterviewPrep(
              body.cv,
              body.jobDesc,
              body.company ?? "",
              apiKey()
            );
            sendJson(res, 200, { prep });
            return;
          }

          if (url === "/api/draft-follow-up") {
            const draft = await generateFollowUpDraft(
              body.cv,
              body.jobDesc,
              body.company ?? "",
              body.roleTitle ?? "",
              body.notes ?? "",
              apiKey()
            );
            sendJson(res, 200, { draft });
            return;
          }

          const result = await generateTailoredCv(body.cv, body.jobDesc, apiKey());
          sendJson(res, 200, { result });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Request failed";
          const status =
            message.includes("required") || message.includes("pdfBase64")
              ? 400
              : message.includes("No text found")
                ? 422
                : 500;
          console.error(`[api-dev] ${url}:`, error);
          sendJson(res, status, { error: message });
        }
      });
    },
  };
}

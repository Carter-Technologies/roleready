import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { generateTailoredCv } from "./server/generate";
import { parsePdfFromBase64 } from "./server/parsePdf";

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

export function apiDevPlugin(): Plugin {
  return {
    name: "roleready-api-dev",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];

        if (url !== "/api/parse-cv" && url !== "/api/generate") {
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

          const result = await generateTailoredCv(
            body.cv,
            body.jobDesc,
            env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || ""
          );
          sendJson(res, 200, { result });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Request failed";
          const status =
            message.includes("required") || message.includes("pdfBase64")
              ? 400
              : message.includes("No text found")
                ? 422
                : message.includes("OPENROUTER")
                  ? 500
                  : 500;
          console.error(`[api-dev] ${url}:`, error);
          sendJson(res, status, { error: message });
        }
      });
    },
  };
}

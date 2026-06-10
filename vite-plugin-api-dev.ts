import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { analyzeAts } from "./api/_lib/analyzeAts";
import {
  assertCanTailor,
  assertProFeature,
  BillingError,
  recordTailorUsage,
} from "./api/_lib/billing";
import { getUserFromRequest } from "./api/_lib/auth";
import { generateFollowUpDraft } from "./api/_lib/followUpDraft";
import { generateTailoredCv } from "./api/_lib/generate";
import { generateInterviewPrep } from "./api/_lib/interviewPrep";
import { parsePdfFromBase64 } from "./api/_lib/parsePdf";
import { getStripe } from "./api/_lib/stripe";

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = currency.toLowerCase() === "eur" ? "€" : `${currency.toUpperCase()} `;
    return `${symbol}${amount}`;
  }
}

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

async function requireUserId(req: IncomingMessage, env: Record<string, string>): Promise<string> {
  const auth = req.headers.authorization;
  const request = new Request("http://localhost", {
    headers: auth ? { Authorization: auth } : {},
  });

  Object.assign(process.env, {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY:
      env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  const user = await getUserFromRequest(request);
  if (!user) throw new BillingError("UNAUTHORIZED", "Sign in required");
  return user.id;
}

function billingEnabled(env: Record<string, string>) {
  return !!(env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function apiDevPlugin(): Plugin {
  return {
    name: "roleready-api-dev",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      const apiKey = () => env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "";

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];

        if (url === "/api/pricing" && req.method === "GET") {
          try {
            Object.assign(process.env, {
              STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY,
              STRIPE_PRICE_ID_PRO_MONTHLY:
                env.STRIPE_PRICE_ID_PRO_MONTHLY || process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
            });
            const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim();
            if (!priceId?.startsWith("price_")) {
              sendJson(res, 500, { error: "STRIPE_PRICE_ID_PRO_MONTHLY is not configured" });
              return;
            }
            const stripe = getStripe();
            const price = await stripe.prices.retrieve(priceId);
            if (price.unit_amount == null) {
              sendJson(res, 500, { error: "Price has no unit amount" });
              return;
            }
            const amount = price.unit_amount / 100;
            sendJson(res, 200, {
              amount,
              currency: price.currency,
              interval: price.recurring?.interval ?? "month",
              formatted: formatPrice(amount, price.currency),
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to load pricing";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        if (!url || !API_ROUTES.has(url)) {
          return next();
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = (await readJsonBody(req)) as Record<string, string>;
          const userId = await requireUserId(req, env);
          const enforceBilling = billingEnabled(env);

          if (url === "/api/parse-cv") {
            const text = await parsePdfFromBase64(body.pdfBase64);
            sendJson(res, 200, { text });
            return;
          }

          if (url === "/api/analyze-ats") {
            if (enforceBilling) await assertProFeature(userId, "ATS analysis");
            const analysis = await analyzeAts(body.cv, body.jobDesc, apiKey());
            sendJson(res, 200, { analysis });
            return;
          }

          if (url === "/api/interview-prep") {
            if (enforceBilling) await assertProFeature(userId, "Interview prep");
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
            if (enforceBilling) await assertProFeature(userId, "Follow-up drafts");
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

          if (enforceBilling) await assertCanTailor(userId);
          const result = await generateTailoredCv(body.cv, body.jobDesc, apiKey());
          if (enforceBilling) await recordTailorUsage(userId);
          sendJson(res, 200, { result });
        } catch (error) {
          if (error instanceof BillingError) {
            const status = error.code === "UPGRADE_REQUIRED" ? 402 : 401;
            sendJson(res, status, { error: error.message, code: error.code });
            return;
          }
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

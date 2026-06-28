/**
 * Grant Pro on a profile for local/testing (service role bypasses RLS).
 *
 * Usage:
 *   node scripts/grant-pro.mjs you@email.com
 *   node scripts/grant-pro.mjs you@email.com --free   # revert to free
 *
 * Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const env = {};
  for (const file of [name, ".env"]) {
    try {
      const text = readFileSync(resolve(root, file), "utf8");
      for (const line of text.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i === -1) continue;
        const key = t.slice(0, i).trim();
        let val = t.slice(i + 1).trim();
        if (
          (val.startsWith("'") && val.endsWith("'")) ||
          (val.startsWith('"') && val.endsWith('"'))
        ) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    } catch {
      /* ignore */
    }
  }
  return env;
}

const env = { ...process.env, ...loadEnvFile(".env.local"), ...loadEnvFile(".env") };
const url = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2]?.toLowerCase();
const revert = process.argv.includes("--free");

if (!email || email.startsWith("-")) {
  console.error("Usage: node scripts/grant-pro.mjs <email> [--free]");
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: profile, error: findError } = await supabase
  .from("profiles")
  .select("id, email, full_name, plan, subscription_status")
  .ilike("email", email)
  .maybeSingle();

if (findError) {
  console.error("Lookup failed:", findError.message);
  process.exit(1);
}

if (!profile) {
  console.error(`No profile found for ${email}. Sign up in the app first.`);
  process.exit(1);
}

const patch = revert
  ? {
      plan: "free",
      subscription_status: "canceled",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    }
  : {
      plan: "pro",
      subscription_status: "active",
      stripe_customer_id: profile.stripe_customer_id ?? "cus_local_dev",
      stripe_subscription_id: profile.stripe_subscription_id ?? "sub_local_dev",
      updated_at: new Date().toISOString(),
    };

const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", profile.id);

if (updateError) {
  console.error("Update failed:", updateError.message);
  process.exit(1);
}

const label = profile.full_name || profile.email;
if (revert) {
  console.log(`Reverted to Free: ${label} (${profile.email})`);
} else {
  console.log(`Granted Pro: ${label} (${profile.email})`);
  console.log("Log out and back in, or refresh the app, to see Pro features.");
  console.warn(
    "\nNote: This updates the Supabase project in your .env. If that is production, this account is Pro on prod too."
  );
}

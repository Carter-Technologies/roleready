/**
 * Logical backup via Supabase API (no pg_dump).
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (Dashboard → Settings → API → service_role secret).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = {};
  try {
    const text = readFileSync(resolve(root, ".env"), "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch {
    /* ignore */
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };
const url = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  console.error("Get service_role from Supabase → Settings → API");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const outDir = resolve(root, "supabase/backups");
mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outFile = resolve(outDir, `data_export_${stamp}.json`);

const tables = ["profiles", "cv_requests"];
const dump = { exportedAt: new Date().toISOString(), tables: {} };

for (const table of tables) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error(`${table}:`, error.message);
    dump.tables[table] = { error: error.message };
  } else {
    dump.tables[table] = data;
    console.log(`${table}: ${data?.length ?? 0} rows`);
  }
}

writeFileSync(outFile, JSON.stringify(dump, null, 2));
console.log("Saved:", outFile);

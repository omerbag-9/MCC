// Copies Worker secrets from environment variables (GitHub environment secrets in CI) to the
// Cloudflare Worker, so nothing has to be set with `wrangler secret put` by hand.
//
//   node scripts/sync-secrets.mjs [dev|staging|production]
//
// Only variables that are set and non-empty are uploaded; others are left untouched on the Worker.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { envFlag, envFromArgs, wrangler } from "./lib.mjs";

const env = envFromArgs();

const NAMES = [
  "REVALIDATE_SECRET",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  // Dev-only admin password (ignored by the app on staging/production).
  ...(env === "dev" ? ["ADMIN_PASSWORD"] : []),
];

const secrets = Object.fromEntries(NAMES.filter((n) => process.env[n]).map((n) => [n, process.env[n]]));
if (Object.keys(secrets).length === 0) {
  console.log(`[${env}] No secrets to sync.`);
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), "mcc-secrets-"));
const file = join(dir, "secrets.json");
try {
  writeFileSync(file, JSON.stringify(secrets), { mode: 0o600 });
  wrangler(["secret", "bulk", file, ...envFlag(env)]);
  console.log(`✅ [${env}] Synced secrets: ${Object.keys(secrets).join(", ")}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

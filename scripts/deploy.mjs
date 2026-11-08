// Deploys one environment. Used by CI (.github/workflows/deploy.yml) and locally:
//
//   node scripts/deploy.mjs dev|staging|production      (npm run deploy:dev, ...)
//
// Steps: check wrangler.jsonc ids -> apply D1 migrations -> (dev) load demo content if the
// database is empty -> build -> wrangler deploy -> copy secrets from environment variables.
//
// Locally, run `npx wrangler login` first. In CI, CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
// come from the GitHub environment secrets.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ENVIRONMENTS = ["dev", "staging", "production"];
const env = process.argv[2];
if (!ENVIRONMENTS.includes(env)) fail(`Usage: node scripts/deploy.mjs <${ENVIRONMENTS.join("|")}>`);
// Dev is the top level of wrangler.jsonc; `--env ""` targets it explicitly (avoids a wrangler warning).
const envFlag = ["--env", env === "dev" ? "" : env];

// Secrets copied to the Worker when set (GitHub environment secrets in CI).
const SECRET_NAMES = ["TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "ADMIN_PASSWORD"];

// 1. wrangler.jsonc must have real ids for this environment
const config = parseJsonc(readFileSync("wrangler.jsonc", "utf8"));
const section = env === "dev" ? config : (config.env?.[env] ?? {});
const placeholders = (section.d1_databases ?? []).filter((d) => /^0{8}/.test(d.database_id ?? "0"));
if (placeholders.length > 0) {
  fail(`[${env}] wrangler.jsonc still has a placeholder database_id for "${placeholders[0].database_name}". See README.`);
}

step("Apply database migrations");
run("npx", ["wrangler", "d1", "migrations", "apply", "DB", "--remote", ...envFlag]);

if (env === "dev") {
  step("Load demo content (only if the database is empty)");
  const out = run("npx", ["wrangler", "d1", "execute", "DB", "--remote", "--json", "--command", "SELECT COUNT(*) AS n FROM settings"], { capture: true });
  const count = JSON.parse(out.slice(out.search(/^[[{]/m)))[0].results[0].n;
  if (count === 0) run("npx", ["wrangler", "d1", "execute", "DB", "--remote", "--yes", "--file", "scripts/seed.sql"]);
  else console.log("Database already has content, skipped.");

  step("Add free construction photos to empty picture slots (only while the demo has none)");
  run("node", ["scripts/demo-photos.mjs", "dev"]);
}

step("Build");
run("npx", ["opennextjs-cloudflare", "build"]);

// `wrangler deploy` directly (not `opennextjs-cloudflare deploy`): we skip uploading the build-time
// pages into the cache, so every page renders from D1 on its first visit after a deploy.
step("Deploy");
run("npx", ["wrangler", "deploy", ...envFlag], { env: { OPEN_NEXT_DEPLOY: "true" } });

const secrets = Object.fromEntries(SECRET_NAMES.filter((n) => process.env[n]).map((n) => [n, process.env[n]]));
if (Object.keys(secrets).length > 0) {
  step(`Copy secrets to the Worker: ${Object.keys(secrets).join(", ")}`);
  const dir = mkdtempSync(join(tmpdir(), "mcc-secrets-"));
  try {
    writeFileSync(join(dir, "secrets.json"), JSON.stringify(secrets), { mode: 0o600 });
    run("npx", ["wrangler", "secret", "bulk", join(dir, "secrets.json"), ...envFlag]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`\n✅ Deployed ${env}`);

// ---------------------------------------------------------------------------------------------

function run(cmd, args, { capture = false, env: extraEnv = {} } = {}) {
  const res = spawnSync(cmd, args, {
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
    shell: process.platform === "win32",
  });
  if (res.status !== 0) fail(`Command failed: ${cmd} ${args.join(" ")}`);
  return res.stdout ?? "";
}

function step(title) {
  console.log(`\n▶ ${title}`);
}

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

/** JSON with comments and trailing commas (wrangler.jsonc). Leaves "//" inside strings alone. */
function parseJsonc(text) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2) + 1;
    } else {
      out += c;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

// Deploys one environment. Used by CI (.github/workflows/deploy.yml) and locally:
//
//   node scripts/deploy.mjs dev|staging|production      (npm run deploy:dev, ...)
//
// Steps: check wrangler.jsonc ids -> build -> smoke-test the build locally (nothing remote is
// touched if it fails) -> apply D1 migrations -> (dev) demo content and photos -> move the bundled
// photos into R2 -> wrangler deploy
// -> copy secrets -> smoke-test the live site -> on failure, roll back to the previous version.
//
// Note: a rollback restores the code, not the database. Migrations are additive (new tables and
// columns), so the previous version keeps working with them.
//
// Locally, run `npx wrangler login` first. In CI, CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
// come from the GitHub environment secrets.
import { spawn, spawnSync } from "node:child_process";
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
// The bucket uploads go to; the bundled real photos and logos are moved into it.
const mediaBucket = (section.r2_buckets ?? []).find((b) => b.binding === "MEDIA")?.bucket_name;
const placeholders = (section.d1_databases ?? []).filter((d) => /^0{8}/.test(d.database_id ?? "0"));
if (placeholders.length > 0) {
  fail(`[${env}] wrangler.jsonc still has a placeholder database_id for "${placeholders[0].database_name}". See README.`);
}

step("Build");
run("npx", ["opennextjs-cloudflare", "build"]);

step("Check the build locally (fresh local database with demo content)");
await checkBuildLocally();

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

step("Move the bundled photos and logos (media-import/) into the media bucket");
if (mediaBucket) run("node", ["scripts/move-to-r2.mjs", mediaBucket, ...envFlag]);
else console.warn(`⚠️  No MEDIA bucket for ${env} in wrangler.jsonc: the bundled photos were not moved and will not show.`);

// `wrangler deploy` directly (not `opennextjs-cloudflare deploy`): we skip uploading the build-time
// pages into the cache, so every page renders from D1 on its first visit after a deploy.
const previousVersion = currentVersionId();

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

const siteUrl = section.vars?.SITE_URL ?? "";
if (!siteUrl || siteUrl.includes("example.")) {
  console.warn(`\n⚠️  SITE_URL for ${env} is a placeholder; skipped the live check.`);
} else {
  step(`Check the live site: ${siteUrl}`);
  await new Promise((r) => setTimeout(r, 5000)); // let the new version reach every location
  const live = spawnSync("node", ["scripts/smoke.mjs", siteUrl], { stdio: "inherit" });
  if (live.status !== 0) {
    if (previousVersion) {
      step(`Live check failed: rolling back to the previous version ${previousVersion}`);
      run("npx", ["wrangler", "rollback", previousVersion, "--message", "Automatic rollback: live smoke test failed", "--yes", ...envFlag]);
      fail("Deploy rolled back because the live site failed its checks. See the log above.");
    }
    fail("The live site failed its checks and there is no previous version to roll back to.");
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

/** Starts the built Worker locally with a throwaway database and runs the smoke test against it. */
async function checkBuildLocally() {
  const dir = mkdtempSync(join(tmpdir(), "mcc-check-"));
  const port = 8790 + Math.floor(Math.random() * 100);
  const local = ["--local", "--persist-to", dir, ...envFlag];
  run("npx", ["wrangler", "d1", "migrations", "apply", "DB", ...local]);
  run("npx", ["wrangler", "d1", "execute", "DB", ...local, "--yes", "--file", "scripts/seed.sql"]);
  if (mediaBucket) run("node", ["scripts/move-to-r2.mjs", mediaBucket, "--local", "--persist-to", dir, ...envFlag]);

  const server = spawn("npx", ["wrangler", "dev", "--port", String(port), "--persist-to", dir, ...envFlag], {
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
  });
  const stop = () => {
    try {
      if (process.platform === "win32") server.kill();
      else process.kill(-server.pid, "SIGTERM");
    } catch {
      // already stopped
    }
  };
  try {
    const url = `http://localhost:${port}`;
    let up = false;
    for (let i = 0; i < 90 && !up; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      up = await fetch(url).then(() => true, () => false);
    }
    if (!up) fail("The built site did not start locally.");
    const result = spawnSync("node", ["scripts/smoke.mjs", url], { stdio: "inherit" });
    if (result.status !== 0) fail("The build failed its local checks; nothing was deployed.");
  } finally {
    stop();
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The Worker version currently serving this environment (null on the first deploy). */
function currentVersionId() {
  const res = spawnSync("npx", ["wrangler", "deployments", "list", "--json", ...envFlag], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    shell: process.platform === "win32",
  });
  if (res.status !== 0) return null;
  try {
    const out = res.stdout;
    const list = JSON.parse(out.slice(out.search(/^[[{]/m)));
    const deployments = (Array.isArray(list) ? list : []).filter((d) => d?.versions?.length);
    deployments.sort((a, b) => String(b.created_on).localeCompare(String(a.created_on)));
    const top = deployments[0]?.versions?.slice().sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))[0];
    return top?.version_id ?? null;
  } catch {
    return null;
  }
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

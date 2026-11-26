// Daily backup of one environment (run by .github/workflows/backup.yml, or by hand):
//
//   node scripts/backup.mjs dev|staging|production
//
// 1. Exports the whole D1 database (schema + data) to SQL, gzips it and stores it as
//    backups/d1/<env>/<timestamp>.sql.gz in that environment's backup bucket (BACKUP_BUCKETS below),
//    which it creates on first use. That bucket is never connected to a domain, so it stays private.
//    (Leads contain personal data: never store backups in the media bucket, which is public once it
//    has a custom domain, nor in GitHub artifacts, which are public for a public repository.)
// 2. Moves any backups still in the media bucket (where older versions of this script put them)
//    into the backup bucket.
// 3. Makes sure the lifecycle rules exist: backups expire after 90 days, and the media bucket's
//    trash/ (deleted media, see deleteObjects in lib/actions/admin.ts) after 30 days.
//
// Restore: see README, "Backups and restore".
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { orderedDump } from "./sql-dump.mjs";

const BACKUP_BUCKETS = { dev: "mcc-backups-dev", staging: "mcc-backups-staging", production: "mcc-backups" };
const BACKUP_RULES = [{ name: "expire-backups", prefix: "backups/", days: 90 }];
const MEDIA_RULES = [{ name: "expire-trash", prefix: "trash/", days: 30 }];

const env = process.argv[2];
if (!["dev", "staging", "production"].includes(env)) fail("Usage: node scripts/backup.mjs <dev|staging|production>");
const envFlag = ["--env", env === "dev" ? "" : env];

const config = parseJsonc(readFileSync("wrangler.jsonc", "utf8"));
const section = env === "dev" ? config : config.env?.[env];
const bucket = section?.r2_buckets?.find((b) => b.binding === "MEDIA")?.bucket_name;
const db = section?.d1_databases?.find((d) => d.binding === "DB");
if (!bucket || !db || /^0{8}/.test(db.database_id ?? "0")) fail(`[${env}] no real D1 database / media bucket in wrangler.jsonc yet`);
const backupBucket = BACKUP_BUCKETS[env];

const dir = mkdtempSync(join(tmpdir(), "mcc-backup-"));
try {
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  const sqlFile = join(dir, "backup.sql");
  const gzFile = join(dir, "backup.sql.gz");

  // Schema and data are exported separately and joined schema-first, with rows in dependency order:
  // a single export lists tables alphabetically and does not restore into an empty database.
  console.log(`▶ [${env}] Exporting D1 database "${db.database_name}"`);
  const schemaFile = join(dir, "schema.sql");
  const dataFile = join(dir, "data.sql");
  run(["d1", "export", "DB", "--remote", ...envFlag, "--no-data", "--output", schemaFile]);
  run(["d1", "export", "DB", "--remote", ...envFlag, "--no-schema", "--output", dataFile]);
  const schema = readFileSync(schemaFile);
  if (!schema.includes("CREATE TABLE")) fail("The schema export looks empty; not storing it.");
  // Schema first, then each table's rows after the tables they reference, so the file restores
  // into an empty database (see scripts/sql-dump.mjs).
  const sql = Buffer.from(orderedDump(schema.toString("utf8"), readFileSync(dataFile, "utf8")));
  writeFileSync(sqlFile, sql);
  writeFileSync(gzFile, gzipSync(sql, { level: 9 }));

  if (!tryRun(["r2", "bucket", "info", backupBucket, ...envFlag])) {
    console.log(`▶ Creating the private backup bucket "${backupBucket}"`);
    run(["r2", "bucket", "create", backupBucket, ...envFlag]);
  }

  const key = `backups/d1/${env}/${stamp}.sql.gz`;
  console.log(`▶ Storing ${key} (${(statSync(gzFile).size / 1024).toFixed(1)} KB) in R2 bucket "${backupBucket}"`);
  run(["r2", "object", "put", `${backupBucket}/${key}`, "--file", gzFile, "--content-type", "application/gzip", "--remote", ...envFlag]);

  await moveOldBackups();

  console.log("▶ Checking lifecycle rules");
  ensureRules(backupBucket, BACKUP_RULES);
  ensureRules(bucket, MEDIA_RULES);
  console.log(`\n✅ [${env}] Backup stored: ${backupBucket}/${key}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, `### Backup stored\n\`${backupBucket}/${key}\` (${(statSync(gzFile).size / 1024).toFixed(1)} KB)\n`, { flag: "a" });
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

/** Moves backups that older versions of this script left in the media bucket into the backup bucket. */
async function moveOldBackups() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) {
    console.warn(`⚠️  Not checked for old backups in "${bucket}": listing it needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.`);
    return;
  }
  const keys = [];
  let cursor = "";
  do {
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects`);
    url.searchParams.set("prefix", "backups/");
    url.searchParams.set("per_page", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success || !Array.isArray(data.result)) {
      fail(`Could not list old backups in "${bucket}": HTTP ${res.status} ${JSON.stringify(data?.errors ?? "").slice(0, 300)}`);
    }
    keys.push(...data.result.map((o) => o.key));
    cursor = data.result_info?.is_truncated ? (data.result_info.cursor ?? "") : "";
  } while (cursor);
  if (keys.length === 0) return;

  console.log(`▶ Moving ${keys.length} old backup(s) out of the media bucket "${bucket}" into "${backupBucket}"`);
  for (const [i, k] of keys.entries()) {
    const file = join(dir, `old-backup-${i}.sql.gz`);
    run(["r2", "object", "get", `${bucket}/${k}`, "--file", file, "--remote", ...envFlag]);
    run(["r2", "object", "put", `${backupBucket}/${k}`, "--file", file, "--content-type", "application/gzip", "--remote", ...envFlag]);
    // Only removed from the media bucket once the copy is stored.
    run(["r2", "object", "delete", `${bucket}/${k}`, "--remote", ...envFlag]);
    console.log(`  moved ${k}`);
  }
}

function ensureRules(name, rules) {
  const existing = run(["r2", "bucket", "lifecycle", "list", name, ...envFlag], { capture: true });
  for (const rule of rules) {
    if (existing.includes(rule.name)) continue;
    run(["r2", "bucket", "lifecycle", "add", name, rule.name, rule.prefix, "--expire-days", String(rule.days), "--force", ...envFlag]);
    console.log(`  added ${rule.name} on ${name}: ${rule.prefix} expires after ${rule.days} days`);
  }
}

/** Runs wrangler quietly; true when it succeeded. */
function tryRun(args) {
  const res = spawnSync("npx", ["wrangler", ...args], { stdio: "ignore", shell: process.platform === "win32" });
  return res.status === 0;
}

function run(args, { capture = false } = {}) {
  const res = spawnSync("npx", ["wrangler", ...args], {
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) fail(`wrangler ${args.slice(0, 3).join(" ")} failed`);
  return res.stdout ?? "";
}

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

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

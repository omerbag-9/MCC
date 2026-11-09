// Daily backup of one environment (run by .github/workflows/backup.yml, or by hand):
//
//   node scripts/backup.mjs dev|staging|production
//
// 1. Exports the whole D1 database (schema + data) to SQL, gzips it and stores it in that
//    environment's media bucket under backups/d1/<env>/<timestamp>.sql.gz. The bucket is private and
//    backups/ is never served by the site. (Leads contain personal data: never store backups in
//    GitHub artifacts, which are public for a public repository.)
// 2. Makes sure the bucket's lifecycle rules exist: backups/ expire after 90 days, trash/ (deleted
//    media, see deleteObjects in lib/actions/admin.ts) after 30 days.
//
// Restore: see README, "Backups and restore".
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const RULES = [
  { name: "expire-backups", prefix: "backups/", days: 90 },
  { name: "expire-trash", prefix: "trash/", days: 30 },
];

const env = process.argv[2];
if (!["dev", "staging", "production"].includes(env)) fail("Usage: node scripts/backup.mjs <dev|staging|production>");
const envFlag = ["--env", env === "dev" ? "" : env];

const config = parseJsonc(readFileSync("wrangler.jsonc", "utf8"));
const section = env === "dev" ? config : config.env?.[env];
const bucket = section?.r2_buckets?.find((b) => b.binding === "MEDIA")?.bucket_name;
const db = section?.d1_databases?.find((d) => d.binding === "DB");
if (!bucket || !db || /^0{8}/.test(db.database_id ?? "0")) fail(`[${env}] no real D1 database / media bucket in wrangler.jsonc yet`);

const dir = mkdtempSync(join(tmpdir(), "mcc-backup-"));
try {
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  const sqlFile = join(dir, "backup.sql");
  const gzFile = join(dir, "backup.sql.gz");

  // Schema and data are exported separately and written schema-first: a single export lists tables
  // alphabetically, so rows of project_media come before the projects table exists and the file
  // does not restore into an empty database. (Tested: this format restores with identical counts.)
  console.log(`▶ [${env}] Exporting D1 database "${db.database_name}"`);
  const schemaFile = join(dir, "schema.sql");
  const dataFile = join(dir, "data.sql");
  run(["d1", "export", "DB", "--remote", ...envFlag, "--no-data", "--output", schemaFile]);
  run(["d1", "export", "DB", "--remote", ...envFlag, "--no-schema", "--output", dataFile]);
  const schema = readFileSync(schemaFile);
  if (!schema.includes("CREATE TABLE")) fail("The schema export looks empty; not storing it.");
  const sql = Buffer.concat([schema, Buffer.from("\n"), readFileSync(dataFile)]);
  writeFileSync(sqlFile, sql);
  writeFileSync(gzFile, gzipSync(sql, { level: 9 }));

  const key = `backups/d1/${env}/${stamp}.sql.gz`;
  console.log(`▶ Storing ${key} (${(statSync(gzFile).size / 1024).toFixed(1)} KB) in R2 bucket "${bucket}"`);
  run(["r2", "object", "put", `${bucket}/${key}`, "--file", gzFile, "--content-type", "application/gzip", "--remote", ...envFlag]);

  console.log("▶ Checking lifecycle rules");
  const existing = run(["r2", "bucket", "lifecycle", "list", bucket, ...envFlag], { capture: true });
  for (const rule of RULES) {
    if (existing.includes(rule.name)) continue;
    run(["r2", "bucket", "lifecycle", "add", bucket, rule.name, rule.prefix, "--expire-days", String(rule.days), "--force", ...envFlag]);
    console.log(`  added ${rule.name}: ${rule.prefix} expires after ${rule.days} days`);
  }
  console.log(`\n✅ [${env}] Backup stored: ${bucket}/${key}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, `### Backup stored\n\`${bucket}/${key}\` (${(statSync(gzFile).size / 1024).toFixed(1)} KB)\n`, { flag: "a" });
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
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

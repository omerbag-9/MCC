// Copies the site content from one environment's database and media bucket to another's, for
// example dev -> production before launch (run by .github/workflows/copy-to-production.yml):
//
//   node scripts/copy-data.mjs
//
// Reads FROM_* and TO_* variables: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID and
// R2_BUCKET for each side (the two sides may be in the same account or in different ones), and:
//
// 1. Exports the source D1 database (schema first, then data) and imports it into the target, which
//    must be empty. The migration history comes along, so the next deploy applies no migration
//    twice. Leads, the old WhatsApp click log and the page-cache tags are not copied: they belong to
//    the source environment (on dev they are test data).
// 2. Copies every media object, keeping its content type and cache settings, except the page cache
//    (incremental-cache/), the trash and the database backups.
// 3. Compares row counts per table and object counts, and fails if anything differs.
//
// It only reads the source. It refuses to import into a database that already has tables, and
// overwrites objects of the same name in the target bucket, so a rerun after a failed media copy is
// safe.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { orderedDump } from "./sql-dump.mjs";

const API = "https://api.cloudflare.com/client/v4";
const SKIP_OBJECTS = ["incremental-cache/", "trash/", "backups/"];
const SKIP_ROWS = ["leads", "whatsapp_clicks", "revalidations"];

const from = side("FROM");
const to = side("TO");
if (from.account === to.account && from.db === to.db) fail("FROM and TO are the same database.");
if (from.account === to.account && from.bucket === to.bucket) fail("FROM and TO are the same bucket.");

const dir = mkdtempSync(join(tmpdir(), "mcc-copy-"));
try {
  await copyDatabase();
  await copyMedia();
  console.log(`\n✅ Copied database ${from.db} -> ${to.db} and bucket ${from.bucket} -> ${to.bucket}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------------------------

function side(prefix) {
  const get = (name) => process.env[`${prefix}_${name}`] || fail(`Missing ${prefix}_${name}`);
  return {
    name: prefix,
    token: get("CLOUDFLARE_API_TOKEN"),
    account: get("CLOUDFLARE_ACCOUNT_ID"),
    db: get("D1_DATABASE_ID"),
    bucket: get("R2_BUCKET"),
  };
}

async function copyDatabase() {
  console.log(`\n▶ Database: exporting ${from.db}`);
  const schemaFile = join(dir, "schema.sql");
  const dataFile = join(dir, "data.sql");
  wrangler(from, ["d1", "export", "DB", "--remote", "--no-data", "--output", schemaFile]);
  wrangler(from, ["d1", "export", "DB", "--remote", "--no-schema", "--output", dataFile]);
  const schema = readFileSync(schemaFile, "utf8");
  if (!schema.includes("CREATE TABLE")) fail("The schema export looks empty.");
  const dump = join(dir, "dump.sql");
  // Rows of each table after the tables they reference (see scripts/sql-dump.mjs).
  writeFileSync(dump, orderedDump(schema, readFileSync(dataFile, "utf8"), { skipRows: SKIP_ROWS }));

  const existing = tables(to);
  if (existing.length > 0) {
    fail(`The target database already has tables (${existing.join(", ")}). Import only into an empty database.`);
  }

  console.log(`▶ Database: importing into ${to.db}`);
  wrangler(to, ["d1", "execute", "DB", "--remote", "--yes", "--file", dump]);

  console.log("▶ Database: comparing row counts");
  const differences = [];
  for (const t of tables(from)) {
    const a = SKIP_ROWS.includes(t) ? 0 : count(from, t);
    const b = count(to, t);
    console.log(`  ${t.padEnd(32)} ${String(a).padStart(6)} -> ${b}${SKIP_ROWS.includes(t) ? "  (not copied)" : ""}`);
    if (a !== b) differences.push(t);
  }
  if (differences.length > 0) fail(`Row counts differ for: ${differences.join(", ")}`);
}

async function copyMedia() {
  console.log(`\n▶ Media: listing ${from.bucket}`);
  const objects = (await list(from)).filter((o) => !SKIP_OBJECTS.some((p) => o.key.startsWith(p)));
  console.log(`  ${objects.length} object(s) to copy (skipping ${SKIP_OBJECTS.join(", ")})`);

  let done = 0;
  const queue = [...objects];
  const worker = async () => {
    for (let o = queue.shift(); o; o = queue.shift()) {
      await copyObject(o);
      done++;
      if (done % 25 === 0 || done === objects.length) console.log(`  ${done}/${objects.length}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const copied = new Set((await list(to)).map((o) => o.key));
  const missing = objects.filter((o) => !copied.has(o.key));
  if (missing.length > 0) fail(`${missing.length} object(s) missing in the target bucket, e.g. ${missing[0].key}`);
}

async function copyObject(o) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(objectUrl(from, o.key), { headers: { Authorization: `Bearer ${from.token}` } });
      if (!res.ok) throw new Error(`GET HTTP ${res.status}`);
      const body = Buffer.from(await res.arrayBuffer());
      const meta = o.http_metadata ?? {};
      const headers = { Authorization: `Bearer ${to.token}` };
      headers["Content-Type"] = meta.contentType ?? res.headers.get("content-type") ?? "application/octet-stream";
      const cacheControl = meta.cacheControl ?? res.headers.get("cache-control");
      if (cacheControl) headers["Cache-Control"] = cacheControl;
      const put = await fetch(objectUrl(to, o.key), { method: "PUT", headers, body });
      if (!put.ok) throw new Error(`PUT HTTP ${put.status} ${(await put.text()).slice(0, 200)}`);
      return;
    } catch (error) {
      if (attempt >= 4) fail(`Copying ${o.key} failed: ${error.message}`);
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
}

function objectUrl(s, key) {
  return `${API}/accounts/${s.account}/r2/buckets/${s.bucket}/objects/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function list(s) {
  const objects = [];
  let cursor = "";
  do {
    const url = new URL(`${API}/accounts/${s.account}/r2/buckets/${s.bucket}/objects`);
    url.searchParams.set("per_page", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${s.token}` } });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success || !Array.isArray(data.result)) {
      fail(`Listing ${s.bucket} (${s.name}) failed: HTTP ${res.status} ${JSON.stringify(data?.errors ?? "").slice(0, 300)}`);
    }
    objects.push(...data.result);
    cursor = data.result_info?.is_truncated ? (data.result_info.cursor ?? "") : "";
  } while (cursor);
  return objects;
}

function tables(s) {
  return query(s, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").map((r) => r.name);
}

function count(s, table) {
  return query(s, `SELECT COUNT(*) AS n FROM "${table}"`)[0].n;
}

function query(s, sql) {
  const out = wrangler(s, ["d1", "execute", "DB", "--remote", "--json", "--command", sql], { capture: true });
  return JSON.parse(out.slice(out.search(/^[[{]/m)))[0].results;
}

/** Runs wrangler against one side, with a config that only names that side's database. */
function wrangler(s, args, { capture = false } = {}) {
  const config = join(dir, `wrangler-${s.name}.json`);
  writeFileSync(config, JSON.stringify({ name: "mcc-copy", d1_databases: [{ binding: "DB", database_name: "mcc-db", database_id: s.db }] }));
  const res = spawnSync("npx", ["wrangler", ...args, "--config", config], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"],
    env: { ...process.env, CLOUDFLARE_API_TOKEN: s.token, CLOUDFLARE_ACCOUNT_ID: s.account },
    shell: process.platform === "win32",
  });
  if (res.status !== 0) fail(`wrangler ${args.slice(0, 3).join(" ")} (${s.name}) failed${capture ? `: ${(res.stderr ?? "").slice(-400)}` : ""}`);
  return res.stdout ?? "";
}

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

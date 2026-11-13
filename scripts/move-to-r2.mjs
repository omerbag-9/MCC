// Moves the images bundled in media-import/ (the company's real project photos and client logos,
// added by migrations 0013-0015 as "/clients/..." and "/project-photos/..." paths) into the
// environment's media bucket, then points every database row at the bucket copies.
//
//   node scripts/move-to-r2.mjs <bucket> [--env <name>] [--local --persist-to <dir>]
//
// Runs from scripts/deploy.mjs after the migrations, on every environment. It only touches rows
// that still hold a bundled path, so once an environment is moved it does nothing. Keys follow
// from the path, so a rerun after a failure overwrites the same objects. The database is
// only updated after every upload has succeeded; on any error it exits non-zero and the deploy stops.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const bucket = args[0];
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const local = args.includes("--local");
const target = local ? ["--local", ...(opt("--persist-to") ? ["--persist-to", opt("--persist-to")] : [])] : ["--remote"];
const envFlag = ["--env", opt("--env") ?? ""];
if (!bucket) fail("Usage: node scripts/move-to-r2.mjs <bucket> [--env <name>] [--local --persist-to <dir>]");

/** A path bundled with the site by an earlier migration. */
const BUNDLED = /^\/(clients|project-photos\/[a-z0-9-]+)\/[a-z0-9-]+\.(png|jpg|webp|svg)$/;
const TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", svg: "image/svg+xml" };
/** Every column that can hold an image key. */
const COLUMNS = [
  ["settings", "hero_image_key"],
  ["services", "image_key"],
  ["projects", "cover_key"],
  ["project_media", "key"],
  ["project_media", "thumb_key"],
  ["news_posts", "cover_key"],
  ["clients", "logo_key"],
];

const found = new Set();
for (const [table, column] of COLUMNS) {
  for (const row of query(`SELECT DISTINCT ${column} AS k FROM ${table} WHERE ${column} LIKE '/%'`)) found.add(row.k);
}
const [settings] = query("SELECT content FROM settings WHERE id = 1");
const content = JSON.parse(settings?.content || "{}");
for (const value of Object.values(content)) if (typeof value === "string" && value.startsWith("/")) found.add(value);

const keys = [...found].filter((k) => BUNDLED.test(k));
if (keys.length === 0) {
  console.log("No bundled images left in the database; nothing to move.");
  process.exit(0);
}

// Old path -> bucket key, in the same layout as admin uploads (lib/uploads.ts):
//   /project-photos/<project>/001.webp        -> projects/<project>/photos/001.webp (and 001-thumb.webp)
//   /clients/<client>.png                      -> clients/<client>/logo.png
const moves = new Map();
for (const key of keys) {
  const file = join("media-import", key.slice(1));
  if (!existsSync(file)) fail(`${key} is in the database but ${file} is missing.`);
  const ext = key.split(".").pop();
  const [, area, a, b] = key.split("/");
  const to = area === "clients" ? `clients/${a.replace(/\.\w+$/, "")}/logo.${ext}` : `projects/${a}/photos/${b}`;
  moves.set(key, { file, ext, to });
}

const dir = mkdtempSync(join(tmpdir(), "mcc-move-"));
try {
  for (const [ext, type] of Object.entries(TYPES)) {
    const list = [...moves.values()].filter((m) => m.ext === ext).map((m) => ({ key: m.to, file: m.file }));
    if (list.length === 0) continue;
    console.log(`Uploading ${list.length} ${type} file(s) to ${bucket}`);
    writeFileSync(join(dir, `${ext}.json`), JSON.stringify(list));
    wrangler(["r2", "bulk", "put", bucket, "--filename", join(dir, `${ext}.json`), "--ct", type, "--cc", "public, max-age=31536000, immutable", "--force", ...target, ...envFlag]);
  }

  const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const sql = [];
  for (const [from, { to }] of moves) {
    for (const [table, column] of COLUMNS) sql.push(`UPDATE ${table} SET ${column} = ${q(to)} WHERE ${column} = ${q(from)};`);
  }
  let changed = false;
  for (const [k, v] of Object.entries(content)) {
    if (moves.has(v)) {
      content[k] = moves.get(v).to;
      changed = true;
    }
  }
  if (changed) sql.push(`UPDATE settings SET content = ${q(JSON.stringify(content))} WHERE id = 1;`);
  writeFileSync(join(dir, "moves.sql"), sql.join("\n"));
  wrangler(["d1", "execute", "DB", ...target, ...envFlag, "--yes", "--file", join(dir, "moves.sql")], { capture: true });
  console.log(`Moved ${moves.size} bundled image(s) to the bucket and updated the database.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

function wrangler(cmd, { capture = false } = {}) {
  const res = spawnSync("npx", ["wrangler", ...cmd], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"],
    shell: process.platform === "win32",
  });
  if (res.status !== 0) fail(`wrangler ${cmd.slice(0, 3).join(" ")} failed${capture ? `: ${(res.stderr ?? "").slice(-400)}` : ""}`);
  return res.stdout ?? "";
}

function query(sql) {
  const out = wrangler(["d1", "execute", "DB", ...target, ...envFlag, "--json", "--command", sql], { capture: true });
  return JSON.parse(out.slice(out.search(/^[[{]/m)))[0].results;
}

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

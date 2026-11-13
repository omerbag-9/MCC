// Puts every file the site uses into the media bucket's folder layout (lib/media.ts):
//
//   projects/<project>/photos/<file>.webp (+ -thumb)   projects/<project>/videos/<file>.mp4
//   news/<post>/<file>   clients/<client>/<file>   site/hero/<file>   site/services/<service>/<file>
//   site/pages/<section>/<file>
//
// Two kinds of file are moved:
//   1. Images bundled in media-import/ (the company's real project photos and client logos, added
//      by migrations 0013-0015 as "/clients/..." and "/project-photos/..." paths): uploaded.
//   2. Older uploads stored flat as <area>/<year>/<uuid>.<ext>: copied to their folder, and the
//      old copy is moved to trash/<date>/<old key> (kept 30 days, like a delete in the admin).
//
// Then files under projects/, news/, clients/ and site/ that nothing uses any more (left over from
// the demo content, for example) are moved to the trash the same way. Only files older than a day
// are touched, so a photo uploaded in the admin but not saved yet is safe. Listing a bucket needs
// the Cloudflare API (CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID, as in CI); without them, or if
// the listing fails, this part is skipped with a warning.
//
//   node scripts/move-to-r2.mjs <bucket> [--env <name>] [--local --persist-to <dir>]
//
// Runs from scripts/deploy.mjs after the migrations, on every environment. It only touches rows
// that still hold a bundled path or an old key, so once an environment is organised it does
// nothing. New keys follow from the old ones, so a rerun after a failure overwrites the same
// objects. The database is only updated after every upload has succeeded, and old copies are only
// removed after that; on any error it exits non-zero and the deploy stops.
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
/** An upload from before the folder layout: <area>/<year>/<uuid>[-thumb].<ext> */
const OLD = /^(projects|site|clients)\/(\d{4})\/([a-f0-9-]{36})(-thumb)?\.(webp|jpg|png|avif|mp4|webm)$/;
const TYPES = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  svg: "image/svg+xml",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
};
/** Every column that can hold a media key. */
const COLUMNS = [
  ["settings", "hero_image_key"],
  ["settings", "hero_video_key"],
  ["services", "image_key"],
  ["projects", "cover_key"],
  ["project_media", "key"],
  ["project_media", "thumb_key"],
  ["news_posts", "cover_key"],
  ["clients", "logo_key"],
];

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "unnamed";
const kebab = (s) => slug(String(s).replace(/([a-z])([A-Z])/g, "$1-$2"));

// Where each key in use belongs, from the row that uses it. Earlier entries win, so a news cover
// that is also a project photo stays with the project.
const homes = new Map();
const home = (key, folder) => key && !homes.has(key) && homes.set(key, folder);
for (const m of query("SELECT m.key, m.thumb_key, m.type, p.slug FROM project_media m JOIN projects p ON p.id = m.project_id ORDER BY m.id")) {
  const folder = `projects/${m.slug}/${m.type === "video" ? "videos" : "photos"}`;
  home(m.key, folder);
  home(m.thumb_key, folder);
}
for (const p of query("SELECT slug, cover_key FROM projects")) home(p.cover_key, `projects/${p.slug}/photos`);
for (const n of query("SELECT slug, cover_key FROM news_posts")) home(n.cover_key, `news/${n.slug}`);
for (const c of query("SELECT name, logo_key FROM clients")) home(c.logo_key, `clients/${slug(c.name)}`);
for (const s of query("SELECT title, image_key FROM services")) home(s.image_key, `site/services/${slug(s.title)}`);
const [settings] = query("SELECT hero_image_key, hero_video_key, content FROM settings WHERE id = 1");
home(settings?.hero_image_key, "site/hero");
home(settings?.hero_video_key, "site/hero");
const content = JSON.parse(settings?.content || "{}");
for (const [k, v] of Object.entries(content)) if (typeof v === "string") home(v, `site/pages/${kebab(k)}`);

const dir = mkdtempSync(join(tmpdir(), "mcc-move-"));
try {
  /** old key -> { file (local copy), ext, to (new key), old (true for a bucket object) } */
  const moves = new Map();

  // 1. Bundled files: /project-photos/<project>/001.webp -> projects/<project>/photos/001.webp,
  //    /clients/<client>.png -> clients/<client>/logo.png
  for (const key of homes.keys()) {
    if (!BUNDLED.test(key)) continue;
    const file = join("media-import", key.slice(1));
    if (!existsSync(file)) fail(`${key} is in the database but ${file} is missing.`);
    const ext = key.split(".").pop();
    const [, area, a, b] = key.split("/");
    const to = area === "clients" ? `clients/${a.replace(/\.\w+$/, "")}/logo.${ext}` : `projects/${a}/photos/${b}`;
    moves.set(key, { file, ext, to, old: false });
  }

  // 2. Old uploads: <area>/<year>/<uuid>.<ext> -> <folder>/<year>-<id>.<ext>. Photos also have a
  //    "-thumb" twin that only project_media names, so it is looked for next to every image.
  const oldKeys = new Set();
  for (const key of homes.keys()) {
    const m = OLD.exec(key);
    if (!m) continue;
    oldKeys.add(key);
    if (!m[4] && TYPES[m[5]].startsWith("image/")) oldKeys.add(key.replace(/\.(\w+)$/, "-thumb.$1"));
  }
  for (const key of oldKeys) {
    const [, , year, uuid, thumb = "", ext] = OLD.exec(key);
    const folder = homes.get(key) ?? homes.get(key.replace("-thumb.", "."));
    const file = join(dir, `old-${moves.size}.${ext}`);
    if (!download(key, file)) {
      if (homes.has(key)) fail(`${key} is used by the site but is not in ${bucket}.`);
      continue; // a photo without a thumbnail
    }
    moves.set(key, { file, ext, to: `${folder}/${year}-${uuid.replace(/-/g, "").slice(0, 12)}${thumb}.${ext}`, old: true });
  }

  if (moves.size === 0) {
    console.log("Every file is already in its folder; nothing to move.");
  } else {
    const day = new Date().toISOString().slice(0, 10);
    const trash = [...moves].filter(([, m]) => m.old).map(([key, m]) => ({ ...m, from: key, to: `trash/${day}/${key}` }));
    upload([...moves.values()], "Uploading");

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

    // The site now uses the new keys: old copies go to the trash, then are removed.
    if (trash.length > 0) {
      upload(trash, "Moving old copies to trash/: uploading");
      for (const { from } of trash) wrangler(["r2", "object", "delete", `${bucket}/${from}`, ...target, ...envFlag], { capture: true });
    }
    const counts = [...moves.values()].reduce((c, m) => ((c[m.old ? "old" : "bundled"] += 1), c), { bundled: 0, old: 0 });
    console.log(`Moved ${counts.bundled} bundled file(s) and ${counts.old} older upload(s) into their folders.`);
  }

  // 3. Unused files: everything in a media folder that no row uses (a photo's thumbnail counts as used).
  const used = new Set();
  for (const key of homes.keys()) {
    const now = moves.get(key)?.to ?? key;
    used.add(now);
    used.add(now.replace(/\.(\w+)$/, "-thumb.$1"));
  }
  const objects = await listMedia();
  if (objects) {
    const dayAgo = Date.now() - 24 * 3600 * 1000;
    const unused = objects.filter((o) => !used.has(o.key) && o.time && o.time < dayAgo && TYPES[o.key.split(".").pop()]);
    if (unused.length === 0) {
      console.log(`No unused files in ${bucket}.`);
    } else {
      const day = new Date().toISOString().slice(0, 10);
      const items = [];
      for (const [i, o] of unused.entries()) {
        const ext = o.key.split(".").pop();
        const file = join(dir, `unused-${i}.${ext}`);
        if (download(o.key, file)) items.push({ file, ext, from: o.key, to: `trash/${day}/${o.key}` });
      }
      upload(items, "Moving unused files to trash/: uploading");
      for (const { from } of items) wrangler(["r2", "object", "delete", `${bucket}/${from}`, ...target, ...envFlag], { capture: true });
      console.log(`Moved ${items.length} unused file(s) to trash/${day}/ (removed after 30 days):`);
      for (const { from } of items) console.log(`  ${from}`);
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

/**
 * Every object under the media folders, as { key, time } (upload time in ms), through the
 * Cloudflare API, which wrangler has no command for. Null when it can't be listed.
 */
async function listMedia() {
  // A local run uses the local bucket, which the API can't see (CLOUDFLARE_API_BASE is for testing).
  if (local && !process.env.CLOUDFLARE_API_BASE) return null;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) {
    console.warn("⚠️  Unused files not checked: listing the bucket needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.");
    return null;
  }
  const api = process.env.CLOUDFLARE_API_BASE ?? "https://api.cloudflare.com/client/v4";
  const objects = [];
  try {
    for (const prefix of ["projects/", "news/", "clients/", "site/"]) {
      let cursor = "";
      do {
        const url = new URL(`${api}/accounts/${account}/r2/buckets/${bucket}/objects`);
        url.searchParams.set("prefix", prefix);
        url.searchParams.set("per_page", "1000");
        if (cursor) url.searchParams.set("cursor", cursor);
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success || !Array.isArray(data.result)) {
          throw new Error(`HTTP ${res.status} ${JSON.stringify(data?.errors ?? "").slice(0, 300)}`);
        }
        for (const o of data.result) objects.push({ key: o.key, time: Date.parse(o.last_modified ?? o.uploaded ?? "") || 0 });
        cursor = data.result_info?.is_truncated ? (data.result_info.cursor ?? "") : "";
      } while (cursor);
    }
  } catch (error) {
    console.warn(`⚠️  Unused files not checked: could not list ${bucket} (${error.message}).`);
    return null;
  }
  const dated = objects.filter((o) => o.time).length;
  console.log(`Listed ${objects.length} file(s) in the media folders of ${bucket} (${dated} with an upload time).`);
  if (objects.length > 0 && dated === 0) {
    console.warn("⚠️  Unused files not checked: the listing has no upload times, so recent uploads can't be told apart.");
    return null;
  }
  return objects;
}

/** Uploads { file, ext, to } items with `wrangler r2 bulk put`, one call per content type. */
function upload(items, label) {
  for (const [ext, type] of Object.entries(TYPES)) {
    const list = items.filter((m) => m.ext === ext).map((m) => ({ key: m.to, file: m.file }));
    if (list.length === 0) continue;
    console.log(`${label} ${list.length} ${type} file(s) to ${bucket}`);
    const listFile = join(dir, `bulk-${ext}-${Date.now()}.json`);
    writeFileSync(listFile, JSON.stringify(list));
    wrangler(["r2", "bulk", "put", bucket, "--filename", listFile, "--ct", type, "--cc", "public, max-age=31536000, immutable", "--force", ...target, ...envFlag], { capture: true });
  }
}

/** Downloads one object; false if it is not in the bucket. */
function download(key, file) {
  const res = spawnSync("npx", ["wrangler", "r2", "object", "get", `${bucket}/${key}`, "--file", file, ...target, ...envFlag], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  if (res.status === 0 && existsSync(file)) return true;
  if (/not found|does not exist|NoSuchKey|10007/i.test(`${res.stdout}${res.stderr}`)) return false;
  fail(`wrangler r2 object get ${key} failed: ${(res.stderr ?? "").slice(-400)}`);
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

// Fills the dev environment's empty picture slots with free construction photographs.
//
//   node scripts/demo-photos.mjs dev [--local]
//
// Runs from scripts/deploy.mjs on dev only, and only while the demo is fresh (no hero image and
// no project cover yet), so it never replaces photos uploaded in the admin.
//
// Source: the Openverse API (openverse.org), limited to CC0 and public-domain photographs, which
// are free for commercial use without attribution. Each photo's title, creator, licence and source
// page are printed (and added to the GitHub job summary) so they can be reviewed and replaced.
//
// Never fails the deploy: on any network or API problem it warns and leaves the slots empty.
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const env = process.argv[2] ?? "dev";
const local = process.argv.includes("--local");
const API = process.env.OPENVERSE_API ?? "https://api.openverse.org/v1/images/";
const BUCKET = "mcc-bucket";
const envFlag = ["--env", env === "dev" ? "" : env];
const target = local ? "--local" : "--remote";

// What each slot shows. Projects are matched by the demo slugs in scripts/seed.sql; anything else
// falls back to a general query.
const HERO_QUERY = "construction site crane";
const PROJECT_QUERIES = {
  "palm-hills-villa": "modern villa exterior",
  "nile-business-tower": "office building construction",
  "delta-logistics-hub": "warehouse steel structure",
  "zamalek-apartment-renovation": "apartment interior renovation",
};
const SERVICE_QUERIES = [
  [/resident/i, "house construction"],
  [/commercial/i, "commercial building construction"],
  [/industrial|warehouse/i, "steel frame construction"],
  [/renovat|fit-out|interior/i, "interior renovation"],
  [/design|engineer/i, "architect blueprint"],
  [/manage/i, "construction workers"],
];
const GALLERY_PER_PROJECT = 2;

const used = new Set();
const credits = [];

function wrangler(args, { capture = false } = {}) {
  const res = spawnSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "ignore", "pipe"],
    shell: process.platform === "win32",
  });
  if (res.status !== 0) throw new Error(`wrangler ${args.slice(0, 3).join(" ")} failed: ${(res.stderr ?? "").slice(-400)}`);
  return res.stdout ?? "";
}

function query(sql) {
  const out = wrangler(["d1", "execute", "DB", target, ...envFlag, "--json", "--command", sql], { capture: true });
  return JSON.parse(out.slice(out.search(/^[[{]/m)))[0].results;
}

const sqlString = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function search(q, { landscape = true } = {}) {
  const url = new URL(API);
  url.searchParams.set("q", q);
  url.searchParams.set("license", "cc0,pdm");
  url.searchParams.set("category", "photograph");
  url.searchParams.set("size", "large");
  if (landscape) url.searchParams.set("aspect_ratio", "wide");
  url.searchParams.set("page_size", "20");
  const res = await fetch(url, { headers: { "User-Agent": "mcc-demo-photos/1.0" } });
  if (!res.ok) throw new Error(`Openverse ${res.status} for "${q}"`);
  const data = await res.json();
  return (data.results ?? []).filter((r) => r.url && !used.has(r.id) && (r.width ?? 0) >= 1200);
}

/** Downloads the next unused result for a query, stores a 1920px and 640px WebP in R2, returns keys. */
async function fetchPhoto(q, folder, opts) {
  for (const r of await search(q, opts)) {
    try {
      const res = await fetch(r.url, { headers: { "User-Agent": "mcc-demo-photos/1.0" } });
      if (!res.ok) continue;
      const input = Buffer.from(await res.arrayBuffer());
      const full = await sharp(input).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
      const thumb = await sharp(input).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();

      const base = `${folder}/${new Date().getUTCFullYear()}/${randomUUID()}`;
      const dir = mkdtempSync(join(tmpdir(), "mcc-photo-"));
      try {
        writeFileSync(join(dir, "full.webp"), full.data);
        writeFileSync(join(dir, "thumb.webp"), thumb);
        for (const [suffix, file] of [["", "full.webp"], ["-thumb", "thumb.webp"]]) {
          wrangler(["r2", "object", "put", `${BUCKET}/${base}${suffix}.webp`, "--file", join(dir, file), "--content-type", "image/webp", target, ...envFlag]);
        }
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }

      used.add(r.id);
      credits.push({ q, title: r.title ?? "Untitled", creator: r.creator ?? "unknown", license: `${r.license ?? ""} ${r.license_version ?? ""}`.trim(), page: r.foreign_landing_url ?? r.url, source: r.source ?? "" });
      return { key: `${base}.webp`, thumbKey: `${base}-thumb.webp`, width: full.info.width, height: full.info.height, alt: r.title ?? "" };
    } catch (error) {
      console.warn(`  skipped one result for "${q}": ${error.message}`);
    }
  }
  return null;
}

async function main() {
  const [settings] = query("SELECT hero_image_key FROM settings WHERE id = 1");
  const projects = query("SELECT id, slug, cover_key FROM projects ORDER BY sort_order, id");
  const services = query("SELECT id, title, image_key FROM services ORDER BY sort_order, id");

  if (!settings || settings.hero_image_key || projects.some((p) => p.cover_key)) {
    console.log("Photos already present; demo photos skipped.");
    return;
  }

  const sql = [];

  console.log(`Hero: "${HERO_QUERY}"`);
  const hero = await fetchPhoto(HERO_QUERY, "site");
  if (hero) sql.push(`UPDATE settings SET hero_image_key = ${sqlString(hero.key)} WHERE id = 1;`);

  for (const p of projects) {
    const q = PROJECT_QUERIES[p.slug] ?? "building construction";
    console.log(`Project ${p.slug}: "${q}"`);
    const cover = await fetchPhoto(q, "projects");
    if (!cover) continue;
    sql.push(`UPDATE projects SET cover_key = ${sqlString(cover.key)} WHERE id = ${p.id};`);
    const media = [cover];
    for (let i = 0; i < GALLERY_PER_PROJECT; i++) {
      const extra = await fetchPhoto(q, "projects");
      if (extra) media.push(extra);
    }
    media.forEach((m, i) =>
      sql.push(
        `INSERT INTO project_media (project_id, type, key, thumb_key, width, height, alt, sort_order) VALUES (${p.id}, 'image', ${sqlString(m.key)}, ${sqlString(m.thumbKey)}, ${m.width}, ${m.height}, ${sqlString(m.alt.slice(0, 300))}, ${i + 1});`,
      ),
    );
  }

  for (const s of services.filter((s) => !s.image_key)) {
    const q = SERVICE_QUERIES.find(([re]) => re.test(s.title))?.[1] ?? "construction";
    console.log(`Service ${s.title}: "${q}"`);
    const photo = await fetchPhoto(q, "site", { landscape: false });
    if (photo) sql.push(`UPDATE services SET image_key = ${sqlString(photo.key)} WHERE id = ${s.id};`);
  }

  if (sql.length > 0) {
    const dir = mkdtempSync(join(tmpdir(), "mcc-sql-"));
    try {
      writeFileSync(join(dir, "photos.sql"), sql.join("\n"));
      wrangler(["d1", "execute", "DB", target, ...envFlag, "--yes", "--file", join(dir, "photos.sql")]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log(`\n${credits.length} demo photos added (CC0 / public domain, via Openverse):`);
  for (const c of credits) console.log(`- "${c.title}" by ${c.creator} (${c.license}, ${c.source}) ${c.page}`);

  if (process.env.GITHUB_STEP_SUMMARY && credits.length > 0) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Demo photos added (${credits.length})\nCC0 / public domain via Openverse. Replace any of them in /admin.\n\n| Slot query | Photo | Creator | Licence |\n|---|---|---|---|\n` +
        credits.map((c) => `| ${c.q} | [${c.title.replace(/\|/g, "/")}](${c.page}) | ${c.creator.replace(/\|/g, "/")} | ${c.license} |`).join("\n") +
        "\n",
    );
  }
}

main().catch((error) => {
  console.warn(`⚠️  Demo photos skipped: ${error.message}`);
});

// Fills the dev environment's empty picture slots with free construction photographs.
//
//   node scripts/demo-photos.mjs dev [--local]
//
// Runs from scripts/deploy.mjs on dev only and only fills empty slots, so it never replaces photos
// uploaded in the admin: the hero and service photos while the demo is fresh (no hero yet), and
// the seeded demo projects (scripts/seed.sql slugs) while they have fewer than three photos.
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
// Each slot tries its queries in order until one returns a usable photograph.
const HERO_QUERY = ["construction site crane", "construction site"];
const PROJECT_QUERIES = {
  "palm-hills-villa": ["modern villa exterior", "modern house", "villa"],
  "nile-business-tower": ["office building construction", "office building"],
  "delta-logistics-hub": ["warehouse steel structure", "warehouse", "industrial building", "factory"],
  "zamalek-apartment-renovation": ["apartment interior renovation", "interior renovation", "apartment interior"],
};
const SERVICE_QUERIES = [
  [/resident/i, ["house construction"]],
  [/commercial/i, ["commercial building construction"]],
  [/industrial|warehouse/i, ["steel frame construction"]],
  [/renovat|fit-out|interior/i, ["interior renovation"]],
  [/design|engineer/i, ["architect blueprint", "architect"]],
  [/manage/i, ["construction workers"]],
];
const FALLBACK = ["building construction", "construction"];
const PHOTOS_PER_PROJECT = 3; // cover + gallery

const used = new Set();
/** Titles of photos already on the site (stored as alt text), so a later run doesn't add them twice. */
const usedTitles = new Set();
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

const searches = new Map();
async function search(q, { landscape = true } = {}) {
  const cacheKey = `${q}|${landscape}`;
  if (!searches.has(cacheKey)) searches.set(cacheKey, searchOnce(q, landscape));
  return (await searches.get(cacheKey)).filter((r) => !used.has(r.id) && !usedTitles.has(r.title ?? ""));
}
async function searchOnce(q, landscape) {
  const url = new URL(API);
  url.searchParams.set("q", q);
  url.searchParams.set("license", "cc0,pdm");
  url.searchParams.set("category", "photograph");
  if (landscape) url.searchParams.set("aspect_ratio", "wide");
  url.searchParams.set("page_size", "20");
  const res = await fetch(url, { headers: { "User-Agent": "mcc-demo-photos/1.0" } });
  if (!res.ok) throw new Error(`Openverse ${res.status} for "${q}"`);
  const data = await res.json();
  return (data.results ?? []).filter((r) => r.url && (r.width ?? 0) >= 1200);
}

/** First photo from the queries in order (wide crops first, then any shape), stored in R2. */
async function fetchPhoto(queries, folder, { landscape = true } = {}) {
  const list = [...queries, ...FALLBACK];
  const attempts = landscape ? [true, false] : [false];
  for (const wide of attempts) {
    for (const q of list) {
      const photo = await fetchFrom(q, folder, wide).catch((error) => {
        console.warn(`  search "${q}" failed: ${error.message}`);
        return null;
      });
      if (photo) return photo;
    }
  }
  return null;
}

/** Downloads the next unused result for a query, stores a 1920px and 640px WebP in R2, returns keys. */
async function fetchFrom(q, folder, landscape) {
  for (const r of await search(q, { landscape })) {
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
  const projects = query(
    "SELECT p.id, p.slug, p.cover_key, (SELECT COUNT(*) FROM project_media m WHERE m.project_id = p.id) AS media FROM projects p ORDER BY p.sort_order, p.id",
  );
  const services = query("SELECT id, title, image_key FROM services ORDER BY sort_order, id");
  if (!settings) return;
  for (const row of query("SELECT DISTINCT alt FROM project_media WHERE alt != ''")) usedTitles.add(row.alt);

  const sql = [];
  const fresh = !settings.hero_image_key;

  if (fresh) {
    console.log(`Hero: ${HERO_QUERY.join(" / ")}`);
    const hero = await fetchPhoto(HERO_QUERY, "site");
    if (hero) sql.push(`UPDATE settings SET hero_image_key = ${sqlString(hero.key)} WHERE id = 1;`);
  }

  // Only the seeded demo projects, and only up to three photos each.
  for (const p of projects.filter((p) => PROJECT_QUERIES[p.slug] && p.media < PHOTOS_PER_PROJECT)) {
    const queries = PROJECT_QUERIES[p.slug];
    console.log(`Project ${p.slug}: ${queries.join(" / ")}`);
    let order = p.media;
    for (let i = p.media; i < PHOTOS_PER_PROJECT; i++) {
      const photo = await fetchPhoto(queries, "projects");
      if (!photo) break;
      order += 1;
      sql.push(
        `INSERT INTO project_media (project_id, type, key, thumb_key, width, height, alt, sort_order) VALUES (${p.id}, 'image', ${sqlString(photo.key)}, ${sqlString(photo.thumbKey)}, ${photo.width}, ${photo.height}, ${sqlString(photo.alt.slice(0, 300))}, ${order});`,
      );
      if (!p.cover_key && i === p.media) sql.push(`UPDATE projects SET cover_key = ${sqlString(photo.key)} WHERE id = ${p.id} AND cover_key IS NULL;`);
    }
  }

  if (fresh) {
    for (const s of services.filter((s) => !s.image_key)) {
      const queries = SERVICE_QUERIES.find(([re]) => re.test(s.title))?.[1] ?? [];
      console.log(`Service ${s.title}: ${queries.join(" / ") || "construction"}`);
      const photo = await fetchPhoto(queries, "site", { landscape: false });
      if (photo) sql.push(`UPDATE services SET image_key = ${sqlString(photo.key)} WHERE id = ${s.id};`);
    }
  }

  if (sql.length === 0) {
    console.log("No empty demo picture slots; nothing to do.");
    return;
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

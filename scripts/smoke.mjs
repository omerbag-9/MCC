// Smoke test: checks that the site's key pages work. Used by scripts/deploy.mjs before a deploy
// (against the built Worker running locally) and after it (against the live site).
//
//   node scripts/smoke.mjs <base-url>
//
// Exits non-zero with a list of failures.
const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage: node scripts/smoke.mjs <base-url>");
  process.exit(2);
}

const failures = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${!ok && detail ? ` (${detail})` : ""}`);
  if (!ok) failures.push(name);
};

async function get(path, attempts = 3) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(base + path, { redirect: "manual", headers: { "user-agent": "mcc-smoke-test" } });
      return { status: res.status, headers: res.headers, body: await res.text() };
    } catch (error) {
      last = error;
      await new Promise((r) => setTimeout(r, i * 2000));
    }
  }
  return { status: 0, headers: new Headers(), body: String(last) };
}

console.log(`Smoke test: ${base}`);

const home = await get("/");
check("home page returns 200", home.status === 200, `HTTP ${home.status}`);
check("home page has a heading", /<h1[\s>]/.test(home.body));
check("Content-Security-Policy header", (home.headers.get("content-security-policy") ?? "").includes("frame-ancestors 'none'"));
check("X-Frame-Options header", home.headers.get("x-frame-options") === "DENY");
check("Strict-Transport-Security header", (home.headers.get("strict-transport-security") ?? "").includes("max-age="));

const projects = await get("/projects");
check("projects page returns 200", projects.status === 200, `HTTP ${projects.status}`);
check("projects page has a heading", /<h1[\s>]/.test(projects.body));

const contact = await get("/contact");
check("contact page returns 200", contact.status === 200, `HTTP ${contact.status}`);
check("contact page has the contact form", /<form[\s>]/.test(contact.body));

const sitemap = await get("/sitemap.xml");
check("sitemap.xml returns 200", sitemap.status === 200, `HTTP ${sitemap.status}`);
check("sitemap.xml is a sitemap", sitemap.body.includes("<urlset"));

const robots = await get("/robots.txt");
check("robots.txt returns 200", robots.status === 200, `HTTP ${robots.status}`);

const slug = sitemap.body.match(/\/projects\/([a-z0-9-]+)<\/loc>/)?.[1];
if (slug) {
  const project = await get(`/projects/${slug}`);
  check(`project page /projects/${slug} returns 200`, project.status === 200, `HTTP ${project.status}`);
}

const missing = await get("/projects/this-page-does-not-exist-smoke");
check("unknown page returns 404", missing.status === 404, `HTTP ${missing.status}`);

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\n✅ All checks passed");

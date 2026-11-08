// Runs after each deploy: tells the new deployment to re-render all public pages from D1 on their
// next visit (pages pre-rendered during the build contain placeholder content).
//
//   node scripts/post-deploy.mjs [dev|staging|production]
//
// The site URL is read from SITE_URL in wrangler.jsonc for that environment.
// The secret comes from REVALIDATE_SECRET_<ENV> (e.g. REVALIDATE_SECRET_STAGING) or REVALIDATE_SECRET.
import { envFromArgs, readWranglerConfig } from "./lib.mjs";

const envName = envFromArgs();

const config = readWranglerConfig();
const vars = envName === "dev" ? config.vars : config.env?.[envName]?.vars;
const siteUrl = (process.env.SITE_URL || vars?.SITE_URL || "").replace(/\/+$/, "");
const secret = process.env[`REVALIDATE_SECRET_${envName.toUpperCase()}`] || process.env.REVALIDATE_SECRET || "";

if (!siteUrl || !secret) {
  console.warn(
    `\n⚠️  [${envName}] ${!siteUrl ? "SITE_URL" : `REVALIDATE_SECRET_${envName.toUpperCase()} / REVALIDATE_SECRET`} not set: skipped cache refresh.\n` +
      "   Open /admin and click “Refresh public site”, or set it and run this script again.\n",
  );
  process.exit(0);
}

for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    const res = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
    });
    if (res.ok) {
      console.log(`✅ [${envName}] Public pages refreshed on ${siteUrl}`);
      process.exit(0);
    }
    console.warn(`Refresh attempt ${attempt} failed: HTTP ${res.status}`);
  } catch (error) {
    console.warn(`Refresh attempt ${attempt} failed: ${error}`);
  }
  await new Promise((r) => setTimeout(r, attempt * 2000));
}
console.error(`❌ [${envName}] Could not refresh the public pages. Use “Refresh public site” in /admin.`);
process.exit(1);

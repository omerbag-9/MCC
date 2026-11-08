// Runs after `opennextjs-cloudflare deploy`: tells the new deployment to re-render all public pages
// from D1 on their next visit (pages pre-rendered during the build contain placeholder content).
//
// Needs SITE_URL and REVALIDATE_SECRET in the environment (e.g. from your shell or CI secrets).
const siteUrl = (process.env.SITE_URL ?? "").replace(/\/+$/, "");
const secret = process.env.REVALIDATE_SECRET ?? "";

if (!siteUrl || !secret) {
  console.warn(
    "\n⚠️  SITE_URL / REVALIDATE_SECRET not set: skipped cache refresh.\n" +
      "   Open /admin and click “Refresh public site” (or set both variables and run `node scripts/post-deploy.mjs`).\n",
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
      console.log(`✅ Public pages refreshed on ${siteUrl}`);
      process.exit(0);
    }
    console.warn(`Refresh attempt ${attempt} failed: HTTP ${res.status}`);
  } catch (error) {
    console.warn(`Refresh attempt ${attempt} failed: ${error}`);
  }
  await new Promise((r) => setTimeout(r, attempt * 2000));
}
console.error("❌ Could not refresh the public pages. Use “Refresh public site” in /admin.");
process.exit(1);

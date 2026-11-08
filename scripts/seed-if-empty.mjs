// Loads the demo content (scripts/seed.sql) into an environment's remote D1 database, but only if
// it has no site settings yet, so it never overwrites real edits.
//
//   node scripts/seed-if-empty.mjs [dev|staging|production]
import { envFlag, envFromArgs, wrangler } from "./lib.mjs";

const env = envFromArgs();
const flags = ["DB", "--remote", ...envFlag(env)];

const out = wrangler(["d1", "execute", ...flags, "--json", "--command", "SELECT COUNT(*) AS n FROM settings"], { quiet: true });
/** Wrangler may print warnings before the JSON; take the first line that starts a JSON document. */
function parseWranglerJson(text) {
  const start = text.search(/^[[{]/m);
  return start === -1 ? null : JSON.parse(text.slice(start));
}

let count;
try {
  const data = parseWranglerJson(out);
  count = data[0].results[0].n;
} catch {
  console.error(`[${env}] Could not read the settings table (have the migrations run?):\n${out}`);
  process.exit(1);
}

if (count > 0) {
  console.log(`[${env}] Database already has content; demo seed skipped.`);
} else {
  wrangler(["d1", "execute", ...flags, "--yes", "--file", "scripts/seed.sql"]);
  console.log(`✅ [${env}] Demo content loaded.`);
}

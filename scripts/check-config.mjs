// Fails fast (exit 2) if an environment in wrangler.jsonc still has placeholder resource ids,
// so CI can skip the deploy with a clear message instead of failing halfway through.
//
//   node scripts/check-config.mjs [dev|staging|production]
import { envConfig, envFromArgs, readWranglerConfig } from "./lib.mjs";

const env = envFromArgs();
const section = envConfig(readWranglerConfig(), env);
const isPlaceholder = (id) => typeof id !== "string" || /^0{8}/.test(id);

const missing = [
  ...(section.d1_databases ?? []).filter((d) => isPlaceholder(d.database_id)).map((d) => `D1 database "${d.database_name}" (binding ${d.binding})`),
  ...(section.kv_namespaces ?? []).filter((k) => isPlaceholder(k.id)).map((k) => `KV namespace (binding ${k.binding})`),
];

if (missing.length > 0) {
  console.log(`[${env}] wrangler.jsonc still has placeholder ids for:\n  - ${[...new Set(missing)].join("\n  - ")}`);
  process.exit(2);
}
console.log(`[${env}] wrangler.jsonc ids look good.`);

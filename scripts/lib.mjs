// Small helpers shared by the deploy scripts.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const ENVIRONMENTS = ["dev", "staging", "production"];

export function envFromArgs() {
  const env = process.argv[2] ?? "dev";
  if (!ENVIRONMENTS.includes(env)) {
    console.error(`Unknown environment "${env}". Use one of: ${ENVIRONMENTS.join(", ")}.`);
    process.exit(1);
  }
  return env;
}

/** Wrangler's --env flag for an environment ("dev" is the top level of wrangler.jsonc). */
export const envFlag = (env) => (env === "dev" ? [] : ["--env", env]);

/** Runs `npx wrangler ...args`; returns stdout, exits the process on failure. */
export function wrangler(args, { quiet = false } = {}) {
  const res = spawnSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    stdio: quiet ? ["ignore", "pipe", "pipe"] : ["ignore", "pipe", "inherit"],
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    if (quiet) console.error(res.stderr);
    console.error(`wrangler ${args.join(" ")} failed`);
    process.exit(res.status ?? 1);
  }
  return res.stdout;
}

/** Removes // and /* *\/ comments and trailing commas from JSONC, leaving strings untouched. */
export function parseJsonc(text) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2) + 1;
    } else {
      out += c;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}


export function readWranglerConfig() {
  return parseJsonc(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
}

/** The section of wrangler.jsonc that applies to an environment ("dev" = top level). */
export function envConfig(config, env) {
  return env === "dev" ? config : config.env?.[env] ?? {};
}

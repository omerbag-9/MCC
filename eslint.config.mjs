import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", ".open-next/**", ".wrangler/**", "node_modules/**", "cloudflare-env.d.ts", "next-env.d.ts"],
  },
];

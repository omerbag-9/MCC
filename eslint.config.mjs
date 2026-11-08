import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // components/reactbits: third-party code vendored as published (see file headers).
    ignores: ["components/reactbits/**", ".next/**", ".open-next/**", ".wrangler/**", "node_modules/**", "cloudflare-env.d.ts", "next-env.d.ts"],
  },
];

export default config;

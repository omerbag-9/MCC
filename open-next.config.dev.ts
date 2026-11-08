import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/*
 * Dev environment and local preview: same as open-next.config.ts, but the page cache lives in
 * Workers KV because dev runs without R2 (R2 needs a payment card on file).
 * Used via: opennextjs-cloudflare build --openNextConfigPath open-next.config.dev.ts
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: d1NextTagCache,
});

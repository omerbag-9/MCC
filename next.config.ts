import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Images are resized in the browser before upload (see lib/client/image-resize.ts),
  // so we skip Next's paid image optimization on Cloudflare.
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;

// Gives `next dev` access to the local D1 / R2 bindings defined in wrangler.jsonc.
initOpenNextCloudflareForDev();

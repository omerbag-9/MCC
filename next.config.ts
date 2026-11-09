import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/*
 * Content Security Policy. Only the third parties the site really uses are allowed:
 * - Cloudflare Turnstile (lead form):      challenges.cloudflare.com (script + frame)
 * - Cloudflare Web Analytics:              static.cloudflareinsights.com, cloudflareinsights.com
 * - Google Maps embed (contact page):      www.google.com, maps.google.com (frame)
 * - Direct uploads from the admin to R2:   *.r2.cloudflarestorage.com (connect)
 * Images and video may come from the media domain (MEDIA_URL), so img/media allow https:.
 * Scripts allow 'unsafe-inline' because Next.js and the JSON-LD use inline scripts and pages are
 * cached (a per-request nonce would make every page dynamic).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com https://*.r2.cloudflarestorage.com",
  "frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Browsers only honour HSTS over HTTPS, so this is harmless on http://localhost.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Images are resized in the browser before upload (see lib/client/upload.ts),
  // so we skip Next's paid image optimization on Cloudflare.
  images: { unoptimized: true },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Gives `next dev` access to the local D1 / R2 bindings defined in wrangler.jsonc.
initOpenNextCloudflareForDev();

/**
 * Builds a public URL for an object in the MEDIA bucket.
 * In production set MEDIA_URL to the bucket's custom domain (e.g. https://media.example.com) so
 * files are served straight from R2. Without it, files go through the /media/* route of this app.
 */
export function mediaUrl(key: string | null | undefined, base = ""): string | null {
  if (!key) return null;
  // Files bundled with the site (public/), e.g. the client logos added by a migration.
  if (STATIC_ASSET_PATTERN.test(key)) return key;
  const path = key.split("/").map(encodeURIComponent).join("/");
  return base ? `${base.replace(/\/+$/, "")}/${path}` : `/media/${path}`;
}

/** Object keys are generated server-side; anything else is rejected. */
export const MEDIA_KEY_PATTERN = /^(projects|site|clients)\/\d{4}\/[a-f0-9-]{36}(-thumb)?\.(webp|jpg|png|avif|mp4|webm)$/;

/** Images shipped in public/ (not in the bucket) that a row may point to instead of a bucket key. */
export const STATIC_ASSET_PATTERN = /^\/clients\/[a-z0-9-]+\.(png|jpg|webp|svg)$/;

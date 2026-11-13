/**
 * Builds a public URL for an object in the MEDIA bucket.
 * In production set MEDIA_URL to the bucket's custom domain (e.g. https://media.example.com) so
 * files are served straight from R2. Without it, files go through the /media/* route of this app.
 */
export function mediaUrl(key: string | null | undefined, base = ""): string | null {
  if (!key) return null;
  const path = key.split("/").map(encodeURIComponent).join("/");
  return base ? `${base.replace(/\/+$/, "")}/${path}` : `/media/${path}`;
}

/**
 * Object keys are generated server-side; anything else is rejected. The bucket is organised by
 * what a file belongs to (lib/uploads.ts):
 *
 *   projects/<project>/photos/<file>.webp (+ <file>-thumb.webp)   projects/<project>/videos/<file>.mp4
 *   news/<post>/<file>   clients/<client>/<file>   site/hero/<file>   site/services/<service>/<file>
 *   site/pages/<section>/<file>
 *
 * Older uploads used <area>/<year>/<uuid>.<ext>; those keys still match.
 */
export const MEDIA_KEY_PATTERN = /^(projects|news|clients|site)(\/[a-z0-9-]{1,100}){1,3}\.(webp|jpg|png|avif|mp4|webm)$/;

import "server-only";
import { AwsClient } from "aws4fetch";
import { getVar } from "@/lib/env";

/**
 * Where an upload goes in the bucket: an area, then up to two name segments, e.g.
 * projects/<project slug>, news/<post slug>, clients/<client name>, site/services/<service>.
 */
export const UPLOAD_PATH_PATTERN = /^(projects|news|clients|site)(\/[a-z0-9-]{1,80}){0,2}$/;

export const ALLOWED_TYPES: Record<string, { ext: string; kind: "image" | "video"; maxBytes: number }> = {
  "image/webp": { ext: "webp", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/jpeg": { ext: "jpg", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/png": { ext: "png", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/avif": { ext: "avif", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "video/mp4": { ext: "mp4", kind: "video", maxBytes: 100 * 1024 * 1024 },
  "video/webm": { ext: "webm", kind: "video", maxBytes: 100 * 1024 * 1024 },
};

/** Files sent through the Worker itself (when R2 S3 credentials are not configured). */
export const DIRECT_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

/**
 * Generates object keys under the upload's path: <path>/<date>-<id>.<ext>, with project files split
 * into photos/ and videos/. Images get a matching "-thumb" key (same id) for the small variant.
 */
export function newObjectKeys(path: string, contentType: string): { key: string; thumbKey: string | null } {
  const type = ALLOWED_TYPES[contentType];
  if (!type) throw new Error("Unsupported file type");
  if (!UPLOAD_PATH_PATTERN.test(path)) throw new Error("Invalid upload path");
  const sub = path.startsWith("projects/") ? (type.kind === "video" ? "/videos" : "/photos") : "";
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const base = `${path}${sub}/${new Date().toISOString().slice(0, 10)}-${id}`;
  return {
    key: `${base}.${type.ext}`,
    thumbKey: type.kind === "image" ? `${base}-thumb.${type.ext}` : null,
  };
}

/**
 * Returns a presigned URL so the browser can PUT the file straight into R2, bypassing the
 * Worker's CPU and memory limits. Returns null if R2 S3 API credentials aren't configured.
 */
export async function presignUpload(key: string): Promise<string | null> {
  const [accountId, bucket, accessKeyId, secretAccessKey] = await Promise.all([
    getVar("R2_ACCOUNT_ID"),
    getVar("R2_BUCKET_NAME"),
    getVar("R2_ACCESS_KEY_ID"),
    getVar("R2_SECRET_ACCESS_KEY"),
  ]);
  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) return null;

  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
  const url = new URL(`https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`);
  url.searchParams.set("X-Amz-Expires", "900");
  const signed = await client.sign(new Request(url, { method: "PUT" }), { aws: { signQuery: true } });
  return signed.url;
}

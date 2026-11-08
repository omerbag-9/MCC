import { getMediaBucket } from "@/lib/env";
import { MEDIA_KEY_PATTERN } from "@/lib/media";

/**
 * Serves files from the MEDIA bucket. In production prefer a custom domain on the bucket
 * (set MEDIA_URL) so files bypass the Worker entirely; this route is the fallback and is used in dev.
 */
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!MEDIA_KEY_PATTERN.test(key)) return new Response("Not found", { status: 404 });

  const bucket = await getMediaBucket();
  if (!bucket) return new Response("Not found", { status: 404 });
  const range = request.headers.get("range");
  const object = await bucket.get(key, {
    range: range ? request.headers : undefined,
    onlyIf: request.headers,
  });
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("accept-ranges", "bytes");

  // Conditional request matched (If-None-Match etc.): R2 returns metadata without a body.
  if (!("body" in object)) return new Response(null, { status: 304, headers });

  if (range && object.range && "offset" in object.range) {
    const offset = object.range.offset ?? 0;
    const length = object.range.length ?? object.size - offset;
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("content-length", String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("content-length", String(object.size));
  return new Response(object.body, { headers });
}

import { getAdmin } from "@/lib/auth";
import { getMediaBucket } from "@/lib/env";
import { MEDIA_KEY_PATTERN } from "@/lib/media";
import { ALLOWED_TYPES, DIRECT_UPLOAD_MAX_BYTES } from "@/lib/uploads";

/** Fallback upload path (local dev, or production without R2 S3 credentials): body is written to R2 via the binding. */
export async function PUT(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const key = new URL(request.url).searchParams.get("key") ?? "";
  const contentType = request.headers.get("content-type") ?? "";
  const type = ALLOWED_TYPES[contentType];
  if (!MEDIA_KEY_PATTERN.test(key) || !type || !key.endsWith(`.${type.ext}`)) {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > DIRECT_UPLOAD_MAX_BYTES) {
    return Response.json({ error: "Invalid file size" }, { status: 400 });
  }

  const bucket = await getMediaBucket();
  if (!bucket) return Response.json({ error: "Uploads are turned off in this environment" }, { status: 503 });
  await bucket.put(key, body, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
  return Response.json({ ok: true, key });
}

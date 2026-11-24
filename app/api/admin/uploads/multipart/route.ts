import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { getMediaBucket } from "@/lib/env";
import { MEDIA_KEY_PATTERN } from "@/lib/media";
import { ALLOWED_TYPES, UPLOAD_PART_BYTES } from "@/lib/uploads";

/**
 * Upload of a file too large for one request (a video), when R2 S3 credentials are not configured
 * so the browser can't PUT straight to R2. The browser sends it in parts of UPLOAD_PART_BYTES, each
 * written with the R2 binding (lib/client/upload.ts):
 *
 *   POST ?key=…  {"action":"create","contentType":"video/mp4"}   -> {"uploadId"}
 *   PUT  ?key=…&uploadId=…&part=1   <bytes>                        -> {"partNumber","etag"}
 *   POST ?key=…  {"action":"complete","uploadId","parts":[…]}    -> {"ok":true,"key"}
 *   POST ?key=…  {"action":"abort","uploadId"}                    -> {"ok":true}
 *
 * The number of parts is limited so a file can't go past its type's size limit (lib/uploads.ts).
 */

const MAX_PARTS = Math.ceil(Math.max(...Object.values(ALLOWED_TYPES).map((t) => t.maxBytes)) / UPLOAD_PART_BYTES);

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), contentType: z.string() }),
  z.object({
    action: z.literal("complete"),
    uploadId: z.string().min(1).max(1024),
    parts: z
      .array(z.object({ partNumber: z.number().int().min(1).max(MAX_PARTS), etag: z.string().min(1).max(200) }))
      .min(1)
      .max(MAX_PARTS),
  }),
  z.object({ action: z.literal("abort"), uploadId: z.string().min(1).max(1024) }),
]);

/** The key from the query, if it is a media key ending in an allowed type's extension. */
function keyOf(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const type = Object.values(ALLOWED_TYPES).find((t) => key.endsWith(`.${t.ext}`));
  return MEDIA_KEY_PATTERN.test(key) && type ? { key, type } : null;
}

export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const target = keyOf(request);
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!target || !parsed.success) return Response.json({ error: "Invalid upload" }, { status: 400 });
  const bucket = await getMediaBucket();
  if (!bucket) return Response.json({ error: "Uploads are turned off in this environment" }, { status: 503 });
  const body = parsed.data;

  if (body.action === "create") {
    if (ALLOWED_TYPES[body.contentType] !== target.type) return Response.json({ error: "Invalid upload" }, { status: 400 });
    const upload = await bucket.createMultipartUpload(target.key, {
      httpMetadata: { contentType: body.contentType, cacheControl: "public, max-age=31536000, immutable" },
    });
    return Response.json({ uploadId: upload.uploadId });
  }

  const upload = bucket.resumeMultipartUpload(target.key, body.uploadId);
  if (body.action === "abort") {
    await upload.abort().catch(() => {});
    return Response.json({ ok: true });
  }
  try {
    await upload.complete([...body.parts].sort((a, b) => a.partNumber - b.partNumber));
  } catch {
    return Response.json({ error: "The upload could not be finished. Please try again." }, { status: 400 });
  }
  return Response.json({ ok: true, key: target.key });
}

export async function PUT(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const target = keyOf(request);
  const params = new URL(request.url).searchParams;
  const uploadId = params.get("uploadId") ?? "";
  const partNumber = Number(params.get("part"));
  if (!target || !uploadId || uploadId.length > 1024 || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > MAX_PARTS) {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > UPLOAD_PART_BYTES) {
    return Response.json({ error: "Invalid part size" }, { status: 400 });
  }
  const bucket = await getMediaBucket();
  if (!bucket) return Response.json({ error: "Uploads are turned off in this environment" }, { status: 503 });
  try {
    const part = await bucket.resumeMultipartUpload(target.key, uploadId).uploadPart(partNumber, body);
    return Response.json({ partNumber: part.partNumber, etag: part.etag });
  } catch {
    return Response.json({ error: "Part of the upload failed. Please try again." }, { status: 400 });
  }
}

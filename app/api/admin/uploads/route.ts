import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { getMediaBucket } from "@/lib/env";
import { ALLOWED_TYPES, DIRECT_UPLOAD_MAX_BYTES, newObjectKeys, presignUpload, UPLOAD_PATH_PATTERN } from "@/lib/uploads";

const bodySchema = z.object({
  path: z.string().regex(UPLOAD_PATH_PATTERN),
  contentType: z.string(),
  size: z.number().int().positive(),
});

/** multipart: send the file in parts of UPLOAD_PART_BYTES to url (see ./multipart/route.ts). */
export type UploadTarget = { key: string; url: string; multipart?: boolean };
export type UploadPlan = { file: UploadTarget; thumb: UploadTarget | null };

/**
 * Step 1 of an upload: the admin UI asks where to send a file. We answer with object keys and
 * either presigned R2 URLs (direct browser → R2) or, as a fallback, our own /direct endpoint
 * (one request, up to DIRECT_UPLOAD_MAX_BYTES) or /multipart endpoint (larger files, in parts).
 */
export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await getMediaBucket())) {
    return Response.json(
      { error: "Photo and video uploads are turned off in this environment (it has no R2 storage)." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { path, contentType, size } = parsed.data;

  const type = ALLOWED_TYPES[contentType];
  if (!type) return Response.json({ error: "This file type is not supported" }, { status: 400 });
  if (size > type.maxBytes) {
    return Response.json({ error: `File is too large (max ${Math.round(type.maxBytes / 1024 / 1024)} MB)` }, { status: 400 });
  }

  const { key, thumbKey } = newObjectKeys(path, contentType);
  const target = async (k: string): Promise<UploadTarget> => {
    const presigned = await presignUpload(k);
    if (presigned) return { key: k, url: presigned };
    if (size > DIRECT_UPLOAD_MAX_BYTES) return { key: k, url: `/api/admin/uploads/multipart?key=${encodeURIComponent(k)}`, multipart: true };
    return { key: k, url: `/api/admin/uploads/direct?key=${encodeURIComponent(k)}` };
  };

  // A photo's thumbnail is always small (it is resized in the browser).
  const plan: UploadPlan = { file: await target(key), thumb: thumbKey ? await target(thumbKey) : null };
  return Response.json(plan);
}

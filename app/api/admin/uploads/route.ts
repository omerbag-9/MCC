import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { ALLOWED_TYPES, DIRECT_UPLOAD_MAX_BYTES, newObjectKeys, presignUpload, UPLOAD_FOLDERS } from "@/lib/uploads";

const bodySchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
  contentType: z.string(),
  size: z.number().int().positive(),
});

export type UploadTarget = { key: string; url: string };
export type UploadPlan = { file: UploadTarget; thumb: UploadTarget | null };

/**
 * Step 1 of an upload: the admin UI asks where to send a file. We answer with object keys and
 * either presigned R2 URLs (direct browser → R2) or our own /direct endpoint as a fallback.
 */
export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { folder, contentType, size } = parsed.data;

  const type = ALLOWED_TYPES[contentType];
  if (!type) return Response.json({ error: "This file type is not supported" }, { status: 400 });
  if (size > type.maxBytes) {
    return Response.json({ error: `File is too large (max ${Math.round(type.maxBytes / 1024 / 1024)} MB)` }, { status: 400 });
  }

  const { key, thumbKey } = newObjectKeys(folder, contentType);
  const target = async (k: string): Promise<UploadTarget | null> => {
    const presigned = await presignUpload(k);
    if (presigned) return { key: k, url: presigned };
    if (size > DIRECT_UPLOAD_MAX_BYTES) return null;
    return { key: k, url: `/api/admin/uploads/direct?key=${encodeURIComponent(k)}` };
  };

  const file = await target(key);
  if (!file) {
    return Response.json(
      { error: "Large files need R2 upload credentials to be configured (see README, 'Media uploads')." },
      { status: 400 },
    );
  }
  const plan: UploadPlan = { file, thumb: thumbKey ? await target(thumbKey) : null };
  return Response.json(plan);
}

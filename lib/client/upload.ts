"use client";

import type { UploadPlan } from "@/app/api/admin/uploads/route";


export type UploadedMedia = {
  type: "image" | "video";
  key: string;
  thumbKey: string | null;
  width: number | null;
  height: number | null;
};

const FULL_MAX = 1920;
const THUMB_MAX = 640;

async function resize(bitmap: ImageBitmap, max: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob || blob.type !== "image/webp") throw new Error("This browser can't convert images to WebP. Please use Chrome, Edge, Firefox or Safari 16+.");
  return blob;
}

/** Resizes an image in the browser to a ~1920px and a ~640px WebP. */
export async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, FULL_MAX / Math.max(bitmap.width, bitmap.height));
    const [full, thumb] = await Promise.all([resize(bitmap, FULL_MAX, 0.82), resize(bitmap, THUMB_MAX, 0.78)]);
    return { full, thumb, width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) };
  } finally {
    bitmap.close();
  }
}

async function put(url: string, body: Blob, contentType: string, onProgress?: (fraction: number) => void) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed. If this keeps happening, check the R2 bucket CORS settings."));
    xhr.send(body);
  });
}

async function plan(path: string, contentType: string, size: number): Promise<UploadPlan> {
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, contentType, size }),
  });
  const data = (await res.json().catch(() => ({}))) as UploadPlan & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data;
}

export async function uploadMedia(
  file: File,
  /** Bucket folder, e.g. projects/<slug> (see UPLOAD_PATH_PATTERN in lib/uploads.ts). */
  path: string,
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> {
  if (file.type.startsWith("image/")) {
    const img = await prepareImage(file);
    const p = await plan(path, "image/webp", img.full.size);
    await put(p.file.url, img.full, "image/webp", (f) => onProgress?.(f * 0.85));
    if (p.thumb) await put(p.thumb.url, img.thumb, "image/webp", (f) => onProgress?.(0.85 + f * 0.15));
    return { type: "image", key: p.file.key, thumbKey: p.thumb?.key ?? null, width: img.width, height: img.height };
  }
  if (file.type === "video/mp4" || file.type === "video/webm") {
    const p = await plan(path, file.type, file.size);
    await put(p.file.url, file, file.type, onProgress);
    return { type: "video", key: p.file.key, thumbKey: null, width: null, height: null };
  }
  throw new Error(`${file.name}: unsupported file type. Use JPG, PNG, WebP, MP4 or WebM.`);
}

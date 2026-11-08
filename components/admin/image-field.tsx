"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media";
import { uploadMedia, type UploadFolder } from "@/lib/client/upload";

/** Single image picker that uploads to R2 and stores the object key in a hidden input. */
export function ImageField({
  name,
  label,
  folder,
  defaultKey,
  mediaBase,
  hint,
  enabled = true,
}: {
  name: string;
  label: string;
  folder: UploadFolder;
  defaultKey: string | null;
  mediaBase: string;
  hint?: string;
  enabled?: boolean;
}) {
  const [key, setKey] = useState(defaultKey ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `img-${name}`;
  const preview = mediaUrl(key, mediaBase);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadMedia(file, folder);
      setKey(uploaded.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={key} />
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sand ring-1 ring-line">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted">No image</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!enabled && <span className="text-xs text-muted">Uploads are turned off in this environment.</span>}
          {enabled && <label htmlFor={id} className={`btn border border-line bg-white py-2 text-ink hover:bg-sand ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
            {busy ? "Uploading…" : key ? "Replace" : "Upload"}
          </label>}
          {enabled && <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />}
          {key && (
            <button type="button" className="btn py-2 text-red-700 hover:bg-red-50" onClick={() => setKey("")}>
              Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}

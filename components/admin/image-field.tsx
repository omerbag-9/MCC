"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/media";
import { uploadMedia } from "@/lib/client/upload";
import { slugify } from "@/lib/format";
import { ProjectPhotoPicker } from "./project-photo-picker";

/** Single image (or video) picker that uploads to R2 and stores the object key in a hidden input. */
export function ImageField({
  name,
  label,
  path,
  nameFrom = [],
  defaultKey,
  mediaBase,
  hint,
  enabled = true,
  kind = "image",
  fromProjects = kind === "image",
}: {
  name: string;
  label: string;
  /** Bucket folder, e.g. "clients" or "site/hero". */
  path: string;
  /** Form fields (first one filled in) whose value names a subfolder, e.g. the client's name. */
  nameFrom?: string[];
  defaultKey: string | null;
  mediaBase: string;
  hint?: string;
  enabled?: boolean;
  kind?: "image" | "video";
  /** Offer "Choose from projects" (reuse a project photo); on for photos unless turned off. */
  fromProjects?: boolean;
}) {
  const [key, setKey] = useState(defaultKey ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `img-${name}`;
  const hidden = useRef<HTMLInputElement>(null);

  // Tell the surrounding form (EditorForm) that something changed, and follow its Discard (reset).
  const change = (next: string) => {
    setKey(next);
    requestAnimationFrame(() => hidden.current?.dispatchEvent(new Event("input", { bubbles: true })));
  };
  useEffect(() => {
    const form = hidden.current?.form;
    if (!form) return;
    const onReset = () => setKey(defaultKey ?? "");
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultKey]);
  const preview = mediaUrl(key, mediaBase);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = hidden.current?.form;
      const named = nameFrom
        .map((n) => slugify((form?.elements.namedItem(n) as HTMLInputElement | null)?.value ?? ""))
        .find(Boolean);
      const uploaded = await uploadMedia(file, named ? `${path}/${named}` : path);
      change(uploaded.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input ref={hidden} type="hidden" name={name} value={key} />
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sand ring-1 ring-line">
          {preview && kind === "video" ? (
            <video src={preview} muted loop autoPlay playsInline className="size-full object-cover" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted">{kind === "video" ? "No video" : "No image"}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!enabled && <span className="text-xs text-muted">Uploads are turned off in this environment.</span>}
          {enabled && <label htmlFor={id} className={`btn border border-line bg-white py-2 text-ink hover:bg-sand ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
            {busy ? "Uploading…" : key ? "Replace" : "Upload"}
          </label>}
          {enabled && <input id={id} type="file" accept={kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif"} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />}
          {fromProjects && <ProjectPhotoPicker current={key} onPick={change} />}
          {key && (
            <button type="button" className="btn py-2 text-red-700 hover:bg-red-50" onClick={() => change("")}>
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

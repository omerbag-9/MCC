"use client";

import { useEffect, useId, useRef, useState } from "react";
import { uploadMedia } from "@/lib/client/upload";
import { mediaUrl } from "@/lib/media";
import { ProjectPhotoPicker } from "./project-photo-picker";

const MAX = 12;
const SECONDS = [4, 5, 6, 8, 10, 12];
const thumbOf = (key: string) => key.replace(/\.(\w+)$/, "-thumb.$1");

/**
 * The hero slideshow's photos: uploaded here or chosen from the projects, put in order with the
 * arrows, and how long each one stays. The list is saved as JSON in a hidden input.
 */
export function HeroSlidesField({
  defaultKeys,
  defaultSeconds,
  fallbackKeys,
  mediaBase,
  enabled,
}: {
  defaultKeys: string[];
  defaultSeconds: number;
  /** What the slideshow shows while no photo is chosen (the hero photo and featured covers). */
  fallbackKeys: string[];
  mediaBase: string;
  enabled: boolean;
}) {
  const [keys, setKeys] = useState(defaultKeys);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const id = `hero-slides-${useId().replace(/:/g, "")}`;

  // Tell the surrounding form (EditorForm) that something changed, and follow its Discard (reset).
  const change = (next: string[]) => {
    setKeys(next);
    requestAnimationFrame(() => hidden.current?.dispatchEvent(new Event("input", { bubbles: true })));
  };
  useEffect(() => {
    const form = hidden.current?.form;
    if (!form) return;
    const onReset = () => setKeys(defaultKeys);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultKeys]);

  const add = (more: string[]) => change([...keys, ...more.filter((k) => !keys.includes(k))].slice(0, MAX));
  const move = (i: number, by: number) => {
    const next = [...keys];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    change(next);
  };

  async function onFiles(list: FileList | null) {
    const files = Array.from(list ?? []).slice(0, MAX - keys.length);
    if (files.length === 0) return;
    setError(null);
    const uploaded: string[] = [];
    try {
      for (const [i, file] of files.entries()) {
        setBusy(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…");
        uploaded.push((await uploadMedia(file, "site/hero/slides")).key);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (uploaded.length) add(uploaded);
    }
  }

  const room = MAX - keys.length;

  return (
    <div>
      <span className="label">Slideshow photos</span>
      <input ref={hidden} type="hidden" name="heroSlides" value={JSON.stringify(keys)} />

      {keys.length > 0 ? (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {keys.map((key, i) => (
            <li key={key} className="overflow-hidden rounded-md bg-white ring-1 ring-line">
              <div className="relative aspect-[16/10] bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(thumbOf(key), mediaBase) ?? ""} alt="" loading="lazy" className="size-full object-cover" />
                <span className="absolute top-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-xs font-semibold text-paper tabular-nums">{i + 1}</span>
              </div>
              <div className="flex items-center gap-1 p-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn px-2.5 py-1 hover:bg-sand disabled:opacity-30" aria-label={`Move photo ${i + 1} earlier`}>
                  ←
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === keys.length - 1} className="btn px-2.5 py-1 hover:bg-sand disabled:opacity-30" aria-label={`Move photo ${i + 1} later`}>
                  →
                </button>
                <button type="button" onClick={() => change(keys.filter((k) => k !== key))} className="btn ml-auto px-2.5 py-1 text-sm text-red-700 hover:bg-red-50" aria-label={`Remove photo ${i + 1}`}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-md bg-sand px-4 py-3 text-sm">
          <p className="font-medium">No photos chosen yet.</p>
          <p className="mt-0.5 text-muted">
            {fallbackKeys.length > 1
              ? `Until you add some, the slideshow uses the background photo and the featured projects' covers (${fallbackKeys.length} photos).`
              : "Add at least two photos for the slideshow to move."}
          </p>
          {fallbackKeys.length > 1 && (
            <div className="mt-2 flex gap-1.5 opacity-60">
              {fallbackKeys.slice(0, 6).map((k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={mediaUrl(thumbOf(k), mediaBase) ?? ""} alt="" loading="lazy" className="h-10 w-16 rounded-sm object-cover" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!enabled && <span className="text-xs text-muted">Uploads are turned off in this environment.</span>}
        {enabled && (
          <label htmlFor={id} className={`btn border border-line bg-white py-2 text-ink hover:bg-sand ${busy || room <= 0 ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
            {busy ?? "Upload photos"}
          </label>
        )}
        {enabled && (
          <input
            id={id}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={!!busy || room <= 0}
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        )}
        <ProjectPhotoPicker current={keys} max={room} onPickMany={add} label="Add from projects" />
        {keys.length > 0 && (
          <button type="button" className="btn py-2 text-red-700 hover:bg-red-50" onClick={() => change([])}>
            Remove all
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="font-medium text-ink-soft">Each photo stays</span>
          <select name="heroSlideSeconds" defaultValue={SECONDS.includes(defaultSeconds) ? defaultSeconds : 6} className="field w-auto py-2">
            {SECONDS.map((s) => (
              <option key={s} value={s}>
                {s} seconds
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Up to {MAX} wide photos, at least 1920px. They change by themselves, fading from one to the next, in this order. Visitors who
        ask their device for less motion see the first photo only.
      </p>
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "./icons";

export type GalleryItem = {
  id: number;
  type: "image" | "video";
  src: string;
  thumb: string | null;
  alt: string;
  width: number | null;
  height: number | null;
};

export function Gallery({ items }: { items: GalleryItem[] }) {
  const images = items.filter((i) => i.type === "image");
  const videos = items.filter((i) => i.type === "video");
  const [open, setOpen] = useState<number | null>(null);

  const count = images.length;
  const close = () => setOpen(null);
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count));
  const isOpen = open !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % count));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + count) % count));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, count]);

  const current = open !== null ? images[open] : null;

  return (
    <div className="space-y-6">
      {videos.map((v) => (
        <video
          key={v.id}
          src={v.src}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full rounded-lg bg-black"
          aria-label={v.alt || "Project video"}
        />
      ))}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpen(idx)}
              className="group relative aspect-[4/3] overflow-hidden rounded-md bg-sand"
              aria-label={`Open image ${idx + 1}${img.alt ? `: ${img.alt}` : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumb ?? img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[85vh] max-w-full rounded object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" onClick={close} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
            <CloseIcon />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 sm:left-6"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 sm:right-6"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          <p className="absolute bottom-4 text-sm text-white/70">{open! + 1} / {images.length}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CloseIcon } from "./icons";

export type GalleryItem = {
  id: number;
  type: "image" | "video";
  src: string;
  thumb: string | null;
  alt: string;
  width: number | null;
  height: number | null;
};

const SHOWN = 5;

/** Where each tile of the mosaic sits, by how many tiles there are (4-column grid on desktop). */
function tileClass(i: number, n: number) {
  if (n === 1) return "col-span-2 row-span-2 sm:col-span-4";
  if (n === 2) return "col-span-2 row-span-2 sm:col-span-2";
  if (i === 0) return "col-span-2 row-span-2";
  if (n === 3) return "col-span-1 row-span-1 sm:col-span-2";
  if (n === 4 && i === 1) return "col-span-2 row-span-1";
  return "col-span-1 row-span-1";
}

/**
 * Project photographs as a mosaic (one large, up to four small, the last one counting what's
 * left), opening a full-screen viewer with captions, a thumbnail strip, arrow keys and swipe.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const images = items.filter((i) => i.type === "image");
  const [open, setOpen] = useState<number | null>(null);
  const count = images.length;
  const shown = images.slice(0, SHOWN);
  const more = count - shown.length;

  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const show = (i: number, from?: HTMLElement) => {
    opener.current = from ?? null;
    setOpen(i);
  };
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);
  const isOpen = open !== null;

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, close, step]);

  // Keep the current thumbnail in view.
  useEffect(() => {
    if (open === null) return;
    strip.current?.querySelector<HTMLElement>(`[data-thumb="${open}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [open]);

  if (count === 0) return null;
  const current = open !== null ? images[open] : null;

  return (
    <>
      <div className="grid auto-rows-[clamp(120px,22vw,170px)] grid-cols-2 gap-1 sm:auto-rows-[clamp(150px,15vw,250px)] sm:grid-cols-4">
        {shown.map((img, idx) => {
          const last = idx === shown.length - 1 && more > 0;
          return (
            <button
              key={img.id}
              type="button"
              onClick={(e) => show(idx, e.currentTarget)}
              className={`group relative overflow-hidden bg-ink ${tileClass(idx, shown.length)}`}
              aria-label={last ? `Open gallery, ${count} photos` : `Open photo ${idx + 1} of ${count}${img.alt ? `: ${img.alt}` : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={idx === 0 ? img.src : (img.thumb ?? img.src)}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" aria-hidden />
              {last && (
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-ink/70 text-paper transition-colors group-hover:bg-ink/80">
                  <span className="text-head font-semibold">+{more}</span>
                  <span className="text-small">more photos</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {count > 1 && (
        <button type="button" onClick={(e) => show(0, e.currentTarget)} className="link-arrow mt-6">
          View all {count} photos <ArrowRightIcon width={18} height={18} />
        </button>
      )}

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink text-paper"
          role="dialog"
          aria-modal="true"
          aria-label="Project photos"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <p className="text-small text-on-navy-muted tabular-nums" aria-live="polite">
              {open! + 1} / {count}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="flex size-11 items-center justify-center bg-navy-2 transition-colors hover:bg-paper hover:text-ink"
              aria-label="Close gallery"
            >
              <CloseIcon width={22} height={22} />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current.id} src={current.src} alt={current.alt} className="max-h-full max-w-full animate-[toast-in_.35s_ease-out] object-contain" />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-4 hidden size-12 items-center justify-center bg-navy-2 transition-colors hover:bg-paper hover:text-ink sm:flex"
                  aria-label="Previous photo"
                >
                  <ArrowRightIcon className="rotate-180" width={22} height={22} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-4 hidden size-12 items-center justify-center bg-navy-2 transition-colors hover:bg-paper hover:text-ink sm:flex"
                  aria-label="Next photo"
                >
                  <ArrowRightIcon width={22} height={22} />
                </button>
              </>
            )}
          </div>

          <div className="shrink-0 px-4 pt-4 pb-5 sm:px-6">
            {current.alt && <p className="mb-4 text-center text-small text-on-navy-muted">{current.alt}</p>}
            {count > 1 && (
              <div ref={strip} className="no-scrollbar flex justify-start gap-1 overflow-x-auto sm:justify-center">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    data-thumb={i}
                    onClick={() => setOpen(i)}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === open}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden transition-opacity sm:h-16 sm:w-24 ${i === open ? "opacity-100 ring-2 ring-paper ring-inset" : "opacity-50 hover:opacity-90"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.thumb ?? img.src} alt="" loading="lazy" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

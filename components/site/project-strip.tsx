"use client";

import { useRef } from "react";
import { ArrowRightIcon } from "./icons";

/**
 * Projects as a filmstrip: one slide in the middle, its neighbours cut by the screen edges.
 * Native horizontal scroll with snap points; the two buttons step one slide.
 */
export function ProjectStrip({ children, count }: { children: React.ReactNode; count: number }) {
  const strip = useRef<HTMLDivElement>(null);
  const step = (dir: 1 | -1) => {
    const el = strip.current;
    const slide = el?.querySelector<HTMLElement>("[data-slide]");
    if (!el || !slide) return;
    el.scrollBy({ left: dir * (slide.offsetWidth + 20), behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={strip}
        className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[9%] lg:gap-5 lg:px-[13.5%]"
        role="region"
        aria-label="Featured projects"
        tabIndex={0}
      >
        {children}
      </div>
      {count > 1 && (
        <div className="container-x mt-8 flex gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous project" className="flex size-12 items-center justify-center bg-paper text-ink transition-colors hover:bg-ink hover:text-paper">
            <ArrowRightIcon className="rotate-180" width={20} height={20} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next project" className="flex size-12 items-center justify-center bg-paper text-ink transition-colors hover:bg-ink hover:text-paper">
            <ArrowRightIcon width={20} height={20} />
          </button>
        </div>
      )}
    </div>
  );
}

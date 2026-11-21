"use client";

import { useCallback, useEffect, useState } from "react";

export type HeroSlide = { src: string; thumb: string | null };

/** Crossfade length; keep in step with .hero-slide in globals.css. */
const FADE_MS = 1200;

/**
 * The hero's slideshow: photos stacked behind the title, each fading into the next after
 * `seconds`, with a slow drift while it shows. Lines under the hero's text show which photo is up
 * and move to one. It waits while the tab is hidden; with reduced motion it stays on the first
 * photo and only the lines change it.
 *
 * Renders the background layer and wraps the hero's text, so the lines can sit under it.
 */
export function HeroSlideshow({
  slides,
  seconds,
  alt,
  children,
}: {
  slides: HeroSlide[];
  seconds: number;
  alt: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  // Photos load as they come up (the first at once, the next one ahead of time).
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % slides.length]));
  const [still, setStill] = useState(false);
  const [hidden, setHidden] = useState(false);

  const show = useCallback(
    (i: number) => {
      setActive(i);
      setLoaded((prev) => (prev.has(i) && prev.has((i + 1) % slides.length) ? prev : new Set([...prev, i, (i + 1) % slides.length])));
    },
    [slides.length],
  );

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setStill(motion.matches);
    const onVisible = () => setHidden(document.hidden);
    onMotion();
    onVisible();
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // A fresh timer each time a photo comes up, so one picked by hand gets its full time too.
  useEffect(() => {
    if (still || hidden || slides.length < 2) return;
    const timer = window.setTimeout(() => show((active + 1) % slides.length), seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [active, still, hidden, seconds, slides.length, show]);

  const style = { "--hero-slide-ms": `${seconds * 1000 + FADE_MS}ms` } as React.CSSProperties;

  return (
    <>
      <div className="absolute inset-0 -z-20 overflow-hidden" style={style}>
        {slides.map((s, i) =>
          loaded.has(i) ? (
            <div key={s.src} className="hero-slide absolute inset-0" data-active={i === active ? "" : undefined} aria-hidden={i !== active}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                srcSet={s.thumb ? `${s.thumb} 640w, ${s.src} 1920w` : undefined}
                sizes={s.thumb ? "100vw" : undefined}
                alt={i === 0 ? alt : ""}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                decoding="async"
                className="size-full object-cover"
              />
            </div>
          ) : null,
        )}
      </div>

      <div className="flex flex-1 flex-col">
        {children}
        {slides.length > 1 && (
          <div className="container-x pb-6 sm:pb-8">
            <ul className="flex flex-wrap gap-1.5" aria-label="Photos">
              {slides.map((s, i) => (
                <li key={s.src}>
                  <button
                    type="button"
                    onClick={() => show(i)}
                    aria-label={`Show photo ${i + 1} of ${slides.length}`}
                    aria-current={i === active ? "true" : undefined}
                    className="group flex h-6 items-center"
                  >
                    <span className="relative block h-[3px] w-8 overflow-hidden bg-paper/30 transition-colors group-hover:bg-paper/50 sm:w-12">
                      {i === active && (
                        <span
                          key={`${active}-${still || hidden ? "still" : "run"}`}
                          className={`absolute inset-0 origin-left bg-paper ${still || hidden ? "" : "hero-slide-progress"}`}
                          style={{ animationDuration: `${seconds}s` }}
                        />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

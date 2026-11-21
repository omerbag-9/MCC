"use client";

import { useEffect, useState } from "react";

export type HeroSlide = { src: string; thumb: string | null };

/** Crossfade length; keep in step with .hero-slide in globals.css. */
const FADE_MS = 1200;

/**
 * The hero's slideshow: photos stacked behind the title, each fading into the next after
 * `seconds`, with a slow drift while it shows. It waits while the tab is hidden; with reduced
 * motion it stays on the first photo.
 */
export function HeroSlideshow({ slides, seconds, alt }: { slides: HeroSlide[]; seconds: number; alt: string }) {
  const [active, setActive] = useState(0);
  // Photos load as they come up (the first at once, the next one ahead of time).
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % slides.length]));
  const [still, setStill] = useState(false);
  const [hidden, setHidden] = useState(false);

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

  useEffect(() => {
    if (still || hidden || slides.length < 2) return;
    const timer = window.setTimeout(() => {
      const next = (active + 1) % slides.length;
      setActive(next);
      setLoaded((prev) => new Set([...prev, next, (next + 1) % slides.length]));
    }, seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [active, still, hidden, seconds, slides.length]);

  const style = { "--hero-slide-ms": `${seconds * 1000 + FADE_MS}ms` } as React.CSSProperties;

  return (
    <div className="absolute inset-0" style={style}>
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
  );
}

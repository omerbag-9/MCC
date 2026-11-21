import type { HeroMode, Settings } from "@/lib/db/schema";

type HeroSettings = Pick<Settings, "heroMode" | "heroImageKey" | "heroVideoKey" | "heroSlides">;

/** What the admin chose for the hero; before anything was chosen, the video when there is one. */
export function heroModeOf(s: HeroSettings): HeroMode {
  return s.heroMode ?? (s.heroVideoKey ? "video" : "photo");
}

/** The slideshow's photos while none is chosen: the hero photo, then the featured projects' covers. */
export function heroFallbackSlides(s: HeroSettings, featured: { coverKey: string | null }[]): string[] {
  return Array.from(new Set([s.heroImageKey, ...featured.map((p) => p.coverKey)].filter((k): k is string => !!k)));
}

/** The photos the slideshow shows, in order: the chosen ones, else the fallback. */
export function heroSlides(s: HeroSettings, featured: { coverKey: string | null }[]): string[] {
  return s.heroSlides.length > 0 ? s.heroSlides : heroFallbackSlides(s, featured);
}

import { DrawnSite } from "./drawn-site";
import { MediaImage } from "./media-image";

/** A photograph from the media library, or the drawn construction scene when there is none. */
export function Photo({
  mediaBase,
  src,
  alt,
  sizes,
  className = "",
  priority,
}: {
  mediaBase: string;
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) return <DrawnSite className={`size-full ${className}`} label={alt} />;
  return (
    <MediaImage
      mediaBase={mediaBase}
      src={src}
      thumb={src.replace(/\.(\w+)$/, "-thumb.$1")}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={`size-full object-cover ${className}`}
    />
  );
}

/** Picks distinct photographs for the page's picture slots, in order of preference. */
export function photoPool(...keys: (string | null | undefined)[]) {
  const unique = Array.from(new Set(keys.filter((k): k is string => !!k)));
  let i = 0;
  return {
    /** Next unused photograph, or null once they run out (the slot then shows the drawing). */
    next: () => unique[i++] ?? null,
    /** Any photograph, reusing if needed. */
    any: (n: number) => unique.length ? unique[n % unique.length] : null,
  };
}

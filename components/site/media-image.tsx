import { mediaUrl } from "@/lib/media";

type Props = {
  mediaBase: string;
  src: string | null | undefined;
  /** Smaller variant used on narrow screens / grids */
  thumb?: string | null;
  alt: string;
  width?: number | null;
  height?: number | null;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Plain <img> with a two-step srcset (thumb ~640px, full ~1920px). Images are already resized
 * and converted to WebP when uploaded, so no runtime image optimization is needed.
 */
export function MediaImage({ mediaBase, src, thumb, alt, width, height, sizes, className, priority }: Props) {
  const full = mediaUrl(src, mediaBase);
  if (!full) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-sand to-line text-muted ${className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M2 21h20" />
        </svg>
      </div>
    );
  }
  const small = mediaUrl(thumb, mediaBase);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={full}
      srcSet={small ? `${small} 640w, ${full} 1920w` : undefined}
      sizes={small ? (sizes ?? "100vw") : undefined}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}

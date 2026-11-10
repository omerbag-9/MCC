/**
 * The full MCC Construction logo (mark and lettering), traced from the company's logo file:
 * /logo-white.svg on dark backgrounds, /logo.svg (brand colour) on light ones.
 */
export function Logo({ height, tone = "white", className, alt = "MCC Construction" }: { height: number; tone?: "white" | "brand"; className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === "white" ? "/logo-white.svg" : "/logo.svg"}
      alt={alt}
      width={Math.round((height * 655) / 315)}
      height={height}
      className={className}
      decoding="async"
    />
  );
}

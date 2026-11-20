import type { Settings } from "@/lib/db/schema";

/** Only Google Maps embeds are allowed in the contact page's map. */
export function safeMapUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)google\.[a-z.]+$/.test(u.hostname) && u.pathname.startsWith("/maps") ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * A link that opens the office on Google Maps: the place the map setting searches for (its q=…,
 * e.g. MCC CONSTRUCTION), otherwise the address. Null when there is neither.
 */
export function mapsLink(settings: Pick<Settings, "mapEmbedUrl" | "address">): string | null {
  const embed = safeMapUrl(settings.mapEmbedUrl);
  const query = (embed && new URL(embed).searchParams.get("q")?.trim()) || settings.address.trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

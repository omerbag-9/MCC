import type { Settings } from "@/lib/db/schema";

/** Only Google Maps embeds are allowed in the contact page's map. */
export function safeMapUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)google\.(?:[a-z]{2,3}|com?\.[a-z]{2})$/.test(u.hostname) && u.pathname.startsWith("/maps") ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * What the admin pasted into the map field, as the address the map loads: Google Maps' whole
 * "Embed a map" code (<iframe src="…">), or just its address. Returns "" for an empty field and
 * null for anything that is not a Google Maps embed (a share link like maps.app.goo.gl can't be
 * shown inside a page).
 */
export function mapEmbedFromInput(input: string): string | null {
  const value = input.trim();
  if (!value) return "";
  const src = /<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i.exec(value)?.[1] ?? value;
  const url = safeMapUrl(src.replace(/&amp;/g, "&").trim());
  if (!url) return null;
  const u = new URL(url);
  // An embed is /maps/embed?pb=…, or a search shown with output=embed.
  return u.pathname.startsWith("/maps/embed") || u.searchParams.get("output") === "embed" ? url : null;
}

/**
 * A link that opens the office on Google Maps. From an "Embed a map" code: the exact place it pins
 * (its CID), else its name; from a search: the search; otherwise the address. Null when none.
 */
export function mapsLink(settings: Pick<Settings, "mapEmbedUrl" | "address">): string | null {
  const embed = safeMapUrl(settings.mapEmbedUrl);
  if (embed) {
    const u = new URL(embed);
    const pb = u.searchParams.get("pb") ?? "";
    // The place: !1s0x<area>:0x<cid> (the CID opens it exactly), and its name: !2s<name>
    const cid = /!1s0x[0-9a-f]+(?::|%3A)0x([0-9a-f]+)/i.exec(pb)?.[1];
    if (cid) return `https://www.google.com/maps?cid=${BigInt(`0x${cid}`).toString()}`;
    const name = /!2s([^!]+)/.exec(pb)?.[1];
    const query = (name && decodeURIComponent(name.replace(/\+/g, " "))) || u.searchParams.get("q")?.trim();
    if (query) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  const address = settings.address.trim();
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}

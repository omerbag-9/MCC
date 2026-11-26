import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/db/queries";

// The company name comes from Site settings, so read it per request (crawlers and phones only).
export const dynamic = "force-dynamic";

/** What a phone uses when someone adds the site to their home screen. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: settings.companyName,
    short_name: settings.companyName.split(" ")[0] || settings.companyName,
    description: settings.seoDescription || settings.tagline || undefined,
    start_url: "/",
    display: "browser",
    background_color: "#042630",
    theme_color: "#042630",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

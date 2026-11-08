import type { MetadataRoute } from "next";
import { getAppEnv, getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [siteUrl, appEnv] = await Promise.all([getSiteUrl(), getAppEnv()]);
  // Keep dev and staging out of search engines.
  if (appEnv !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

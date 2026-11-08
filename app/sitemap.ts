import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/db/queries";
import { getSiteUrl } from "@/lib/env";

// Always reflects current projects (cheap: one small query, only crawlers request it).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteUrl, projects] = await Promise.all([getSiteUrl(), getPublishedProjects()]);
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

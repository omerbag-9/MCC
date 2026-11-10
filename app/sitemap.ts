import type { MetadataRoute } from "next";
import { getPublishedNews, getPublishedProjects } from "@/lib/db/queries";
import { getSiteUrl } from "@/lib/env";

// Always reflects current projects (cheap: one small query, only crawlers request it).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteUrl, projects, news] = await Promise.all([getSiteUrl(), getPublishedProjects(), getPublishedNews()]);
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/news`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...news.map((n) => ({
      url: `${siteUrl}/news/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

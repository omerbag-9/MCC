import type { Project, Settings } from "@/lib/db/schema";
import { mediaUrl } from "@/lib/media";

export function siteTitle(settings: Settings) {
  return settings.seoTitle || settings.companyName;
}

export function siteDescription(settings: Settings) {
  return settings.seoDescription || settings.heroSubtitle || settings.tagline;
}

/** schema.org structured data for the company (helps Google show the business panel). */
export function organizationJsonLd(settings: Settings, siteUrl: string, mediaBase: string) {
  const sameAs = [
    settings.facebookUrl,
    settings.instagramUrl,
    settings.linkedinUrl,
    settings.youtubeUrl,
    settings.tiktokUrl,
  ].filter(Boolean);
  const image = mediaUrl(settings.heroImageKey, mediaBase);
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: settings.companyName,
    description: siteDescription(settings),
    url: siteUrl,
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    ...(settings.address && { address: settings.address }),
    ...(image && { image: image.startsWith("http") ? image : `${siteUrl}${image}` }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function projectJsonLd(project: Project, siteUrl: string, image: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${siteUrl}/projects/${project.slug}`,
    ...(project.year && { dateCreated: String(project.year) }),
    ...(project.location && { locationCreated: { "@type": "Place", name: project.location } }),
    ...(image && { image }),
  };
}

/** Safe for embedding in <script type="application/ld+json">. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

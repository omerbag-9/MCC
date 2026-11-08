import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery, type GalleryItem } from "@/components/site/gallery";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/site/icons";
import { MediaImage } from "@/components/site/media-image";
import { WhatsAppLink } from "@/components/site/whatsapp";
import { getPublishedProjectBySlug, getSettings } from "@/lib/db/queries";
import { getMediaBase, getSiteUrl } from "@/lib/env";
import { paragraphs } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { jsonLdScript, projectJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

// Project pages are rendered on first visit and then cached until the admin edits content.
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, mediaBase, siteUrl] = await Promise.all([getPublishedProjectBySlug(slug), getMediaBase(), getSiteUrl()]);
  if (!project) return { title: "Project not found" };
  const cover = mediaUrl(project.coverKey, mediaBase);
  const image = cover && (cover.startsWith("http") ? cover : `${siteUrl}${cover}`);
  const description = project.seoDescription || project.summary;
  return {
    title: project.seoTitle || project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description, type: "article", ...(image && { images: [image] }) },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, settings, mediaBase, siteUrl] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getSettings(),
    getMediaBase(),
    getSiteUrl(),
  ]);
  if (!project) notFound();

  const gallery: GalleryItem[] = project.media.map((m) => ({
    id: m.id,
    type: m.type,
    src: mediaUrl(m.key, mediaBase)!,
    thumb: mediaUrl(m.thumbKey, mediaBase),
    alt: m.alt || project.title,
    width: m.width,
    height: m.height,
  }));

  const wa = whatsappLink(settings.whatsappNumber, `Hi, I'm interested in a project like "${project.title}".`);
  const details = [
    ["Category", project.category],
    ["Location", project.location],
    ["Year", project.year?.toString()],
    ["Area", project.areaM2 ? `${project.areaM2.toLocaleString("en-US")} m²` : ""],
    ["Client", project.client],
  ].filter(([, v]) => v) as [string, string][];
  const cover = mediaUrl(project.coverKey, mediaBase);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(projectJsonLd(project, siteUrl, cover && (cover.startsWith("http") ? cover : `${siteUrl}${cover}`)))}
      />
      <section className="bg-ink pt-10 pb-14 text-white sm:pb-20">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60">
            <Link href="/" className="hover:text-white">Home</Link> <span aria-hidden>/</span>{" "}
            <Link href="/projects" className="hover:text-white">Projects</Link>
          </nav>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{project.title}</h1>
          {project.summary && <p className="mt-4 max-w-2xl text-lg text-white/75">{project.summary}</p>}
        </div>
      </section>

      {project.coverKey && (
        <div className="container-x -mt-8 sm:-mt-12">
          <MediaImage
            mediaBase={mediaBase}
            src={project.coverKey}
            thumb={project.coverKey.replace(/\.(\w+)$/, "-thumb.$1")}
            alt={project.title}
            sizes="(min-width: 1152px) 1152px, 100vw"
            priority
            className="aspect-[16/9] w-full rounded-lg object-cover shadow-xl"
          />
        </div>
      )}

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {project.body && (
              <div className="space-y-4 text-lg leading-relaxed text-ink-soft">
                {paragraphs(project.body).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {gallery.length > 0 && <Gallery items={gallery} />}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {details.length > 0 && (
              <dl className="divide-y divide-line rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
                {details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="rounded-lg bg-brand-soft p-6">
              <p className="font-semibold">Planning a similar project?</p>
              <p className="mt-1 text-sm text-ink-soft">Get a free, no-obligation quote from our team.</p>
              <div className="mt-5 flex flex-col gap-2">
                <Link href="/contact" className="btn-primary">
                  Request a quote <ArrowRightIcon width={16} height={16} />
                </Link>
                {wa && (
                  <WhatsAppLink href={wa} className="btn-whatsapp">
                    <WhatsAppIcon width={18} height={18} /> Ask on WhatsApp
                  </WhatsAppLink>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

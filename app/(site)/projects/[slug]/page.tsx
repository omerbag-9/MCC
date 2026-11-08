import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery, type GalleryItem } from "@/components/site/gallery";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/site/icons";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
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

  const gallery: GalleryItem[] = project.media
    .filter((m) => m.key !== project.coverKey)
    .map((m) => ({
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
    ["Completed", project.year?.toString()],
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

      <section className="pt-12 lg:pt-16">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="text-small text-muted">
            <Link href="/projects" className="inline-flex items-center gap-1.5 hover:text-ink">
              <ArrowRightIcon className="rotate-180" width={16} height={16} /> All projects
            </Link>
          </nav>
          <Reveal className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="text-display font-semibold lg:col-span-7">{project.title}</h1>
            {project.summary && <p className="text-lead text-muted lg:col-span-5">{project.summary}</p>}
          </Reveal>
        </div>
        <div className="container-x mt-12">
          <div className="aspect-[4/3] overflow-hidden bg-ink sm:aspect-[16/8]">
            <Photo mediaBase={mediaBase} src={project.coverKey} alt={project.title} sizes="100vw" priority className="hero-photo" />
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="space-y-5 lg:col-span-7">
            <h2 className="text-head font-semibold">About the project</h2>
            {paragraphs(project.body).map((p, i) => (
              <p key={i} className="max-w-[62ch]">{p}</p>
            ))}
            {!project.body && project.summary && <p className="max-w-[62ch]">{project.summary}</p>}
          </Reveal>

          <Reveal className="space-y-4 lg:col-span-4 lg:col-start-9">
            {details.length > 0 && (
              <dl className="space-y-5 bg-sand p-8">
                {details.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-small text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="bg-ink p-8 text-paper">
              <p className="text-lead font-semibold">Planning something similar?</p>
              <p className="mt-2 text-on-navy-muted">Tell us about it and get a free, no-obligation quote.</p>
              <div className="mt-6 grid gap-2">
                <Link href="/contact" className="btn-light">Request a quote</Link>
                {wa && (
                  <WhatsAppLink href={wa} className="btn-whatsapp">
                    <WhatsAppIcon width={18} height={18} /> Ask on WhatsApp
                  </WhatsAppLink>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="pb-24 lg:pb-36">
          <div className="container-x">
            <h2 className="mb-10 text-head font-semibold">Photos and video</h2>
            <Gallery items={gallery} />
          </div>
        </section>
      )}
    </>
  );
}

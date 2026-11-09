import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery, type GalleryItem } from "@/components/site/gallery";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/site/icons";
import { Photo, photoPool } from "@/components/site/photo";
import { formatArea } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { WhatsAppLink } from "@/components/site/whatsapp";
import { getContent, getPublishedProjectBySlug, getPublishedProjects, getSettings } from "@/lib/db/queries";
import { getMediaBase, getSiteUrl } from "@/lib/env";
import { lines, paragraphs, specRows } from "@/lib/format";
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
  const [project, settings, c, mediaBase, siteUrl, allProjects] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getSettings(),
    getContent(),
    getMediaBase(),
    getSiteUrl(),
    getPublishedProjects(),
  ]);
  if (!project) notFound();

  // Previous and next in the order of the projects page, wrapping round.
  const at = allProjects.findIndex((p) => p.id === project.id);
  const prev = allProjects.length > 1 ? allProjects[(at - 1 + allProjects.length) % allProjects.length] : null;
  const next = allProjects.length > 2 ? allProjects[(at + 1) % allProjects.length] : null;

  const images = project.media.filter((m) => m.type === "image");
  const videos = project.media.filter((m) => m.type === "video");
  const pool = photoPool(project.coverKey, ...images.map((m) => m.key));
  const coverPhoto = pool.next();
  const storyPhoto = pool.next() ?? coverPhoto;
  const overviewPhoto = pool.next() ?? storyPhoto;

  const gallery: GalleryItem[] = images.map((m) => ({
    id: m.id,
    type: m.type,
    src: mediaUrl(m.key, mediaBase)!,
    thumb: mediaUrl(m.thumbKey, mediaBase),
    alt: m.alt || project.title,
    width: m.width,
    height: m.height,
  }));

  const wa = whatsappLink(settings.whatsappNumber, `Hi, I'm interested in a project like "${project.title}".`);
  const keyFacts = [
    ["Location", project.location],
    ["Completed", project.year?.toString() ?? ""],
    ["Area", formatArea(project.areaM2) ?? ""],
    ["Client", project.client],
  ].filter(([, v]) => v) as [string, string][];
  const overview: [string, string][] = [
    ...((project.category ? [["Category", project.category]] : []) as [string, string][]),
    ...keyFacts,
    ...specRows(project.specs),
  ];
  const highlights = lines(project.highlights);
  const body = paragraphs(project.body);
  const cover = mediaUrl(project.coverKey, mediaBase);
  const poster = mediaUrl(coverPhoto, mediaBase);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(projectJsonLd(project, siteUrl, cover && (cover.startsWith("http") ? cover : `${siteUrl}${cover}`)))}
      />

      {/* Header: the project's photograph across the screen, its name, and its key facts along the foot */}
      <section className="relative isolate flex min-h-[480px] flex-col overflow-hidden bg-ink text-paper lg:min-h-[calc(82svh-72px)]">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={coverPhoto} alt={project.title} sizes="100vw" priority className="hero-photo" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/60" />
        <Reveal className="container-x flex flex-1 flex-col justify-end pt-14 pb-10 lg:pb-14">
          <nav aria-label="Breadcrumb" className="text-small text-on-navy-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-paper">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/projects" className="hover:text-paper">Projects</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-paper">{project.title}</li>
            </ol>
          </nav>
          {project.category && (
            <p className="mt-6">
              <Link href={`/projects?category=${encodeURIComponent(project.category)}`} className="inline-block bg-paper px-4 py-2 text-small font-semibold text-ink hover:bg-sand">
                {project.category}
              </Link>
            </p>
          )}
          <h1 className="mt-4 max-w-4xl text-display font-semibold">{project.title}</h1>
          {project.summary && <p className="mt-5 max-w-2xl text-lead text-paper/90">{project.summary}</p>}
        </Reveal>
        {keyFacts.length > 0 && (
          <div className="bg-ink">
            <Reveal className="container-x grid grid-cols-2 gap-y-6 py-6 sm:grid-cols-4 lg:py-8" stagger={0.06} onLoad delay={0.3}>
              {keyFacts.map(([k, v]) => (
                <dl key={k} className="min-w-0 pr-4">
                  <dt className="text-small text-on-navy-muted">{k}</dt>
                  <dd className="mt-1 text-lead font-semibold">{v}</dd>
                </dl>
              ))}
            </Reveal>
          </div>
        )}
      </section>

      {/* The story beside a photograph, set on an ink block that steps out behind it */}
      <section className="section-y">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <h2 className="text-head font-semibold">{c.projectAboutTitle}</h2>
            {(body.length > 0 ? body : [project.summary].filter(Boolean)).map((p, i) => (
              <p key={i} className={i === 0 ? "mt-6 text-lead" : "mt-4"}>
                {p}
              </p>
            ))}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">{c.quoteButton}</Link>
              {wa && (
                <WhatsAppLink href={wa} className="btn-whatsapp">
                  <WhatsAppIcon width={18} height={18} /> Ask on WhatsApp
                </WhatsAppLink>
              )}
            </div>
          </Reveal>
          <Reveal className="relative lg:col-span-6">
            <div className="absolute top-6 right-0 bottom-0 left-6 bg-ink lg:top-10 lg:left-10" aria-hidden />
            <div className="relative mr-6 mb-6 aspect-[4/3] overflow-hidden bg-sand lg:mr-10 lg:mb-10 lg:aspect-[5/4]">
              <Photo mediaBase={mediaBase} src={storyPhoto} alt={project.title} sizes="(min-width: 1024px) 45vw, 100vw" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Overview: every fact in one table on the ink field, with a photograph beside it */}
      {overview.length > 0 && (
        <section className="section-y bg-ink text-paper" aria-labelledby="overview-title">
          <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
            <Reveal className="lg:col-span-6">
              <h2 id="overview-title" className="text-head font-semibold">{c.projectOverviewTitle}</h2>
              <table className="mt-8 w-full text-left">
                <caption className="sr-only">Facts about {project.title}</caption>
                <tbody>
                  {overview.map(([k, v], i) => (
                    <tr key={`${k}-${i}`} className={i % 2 === 0 ? "bg-navy-2" : ""}>
                      <th scope="row" className="w-2/5 px-5 py-4 align-top font-normal text-on-navy-muted">{k || "—"}</th>
                      <td className="px-5 py-4 font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
            <Reveal className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden bg-navy-2 lg:aspect-[4/5]">
                <Photo mediaBase={mediaBase} src={overviewPhoto} alt={project.title} sizes="(min-width: 1024px) 45vw, 100vw" />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Highlights: what was delivered, as a plain list in columns */}
      {highlights.length > 0 && (
        <section className="section-y bg-sand" aria-labelledby="highlights-title">
          <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <h2 id="highlights-title" className="text-head font-semibold">{c.projectHighlightsTitle}</h2>
              <p className="mt-4 max-w-sm text-muted">{c.projectHighlightsIntro}</p>
            </Reveal>
            <Reveal className="grid gap-1 sm:grid-cols-2 lg:col-span-8" stagger={0.05}>
              {highlights.map((h) => (
                <p key={h} className="flex items-start gap-4 bg-paper px-5 py-5 text-lead font-medium">
                  <span className="mt-2.5 size-2.5 shrink-0 bg-ink" aria-hidden />
                  {h}
                </p>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Video tour */}
      {videos.length > 0 && (
        <section className="section-y" aria-labelledby="video-title">
          <div className="container-x">
            <Reveal>
              <h2 id="video-title" className="mb-8 text-head font-semibold">{c.projectVideoTitle}</h2>
              <div className="space-y-6">
                {videos.map((v) => (
                  <video
                    key={v.id}
                    src={mediaUrl(v.key, mediaBase)!}
                    poster={poster ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full bg-ink"
                    aria-label={v.alt || `${project.title} video`}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className={videos.length > 0 ? "pb-16 lg:pb-24" : "section-y"} aria-labelledby="gallery-title">
          <div className="container-x">
            <h2 id="gallery-title" className="mb-8 text-head font-semibold">{c.projectGalleryTitle}</h2>
            <Gallery items={gallery} />
          </div>
        </section>
      )}

      {/* Previous and next project, each as a picture with its name */}
      {prev && (
        <nav aria-label="More projects" className={`container-x grid gap-1 pb-16 lg:pb-24 ${next ? "sm:grid-cols-2" : ""}`}>
          {[
            ["Previous project", prev],
            ...(next ? [["Next project", next] as const] : []),
          ].map(([label, p], i) => {
            const proj = p as typeof prev;
            return (
              <Link key={String(label)} href={`/projects/${proj.slug}`} className="group relative isolate block overflow-hidden bg-ink text-paper">
                <div className="absolute inset-0 -z-20">
                  <Photo mediaBase={mediaBase} src={proj.coverKey} alt="" sizes="50vw" className="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 -z-10 bg-ink/75 transition-colors duration-300 group-hover:bg-ink/60" />
                <div className={`flex min-h-56 flex-col justify-end px-6 py-7 lg:min-h-80 lg:px-8 ${i === 1 ? "sm:items-end sm:text-right" : ""}`}>
                  <span className="flex items-center gap-2 text-small text-on-navy-muted">
                    {i === 0 && <ArrowRightIcon className="rotate-180" width={16} height={16} />}
                    {String(label)}
                    {i === 1 && <ArrowRightIcon width={16} height={16} />}
                  </span>
                  <span className="mt-2 text-head font-semibold">{proj.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      )}

      <section className="bg-sand">
        <Reveal className="container-x grid gap-8 py-14 lg:grid-cols-12 lg:items-center lg:py-16">
          <div className="lg:col-span-8">
            <h2 className="text-head font-semibold">{c.projectCtaTitle}</h2>
            <p className="mt-3 max-w-xl">{c.projectCtaText}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Link href="/contact" className="btn-primary">{c.quoteButton}</Link>
            <Link href="/projects" className="btn bg-paper text-ink hover:bg-brand-soft">All projects</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

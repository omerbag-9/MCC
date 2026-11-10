import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ExternalLinkIcon, SocialIcon } from "@/components/site/icons";
import { CopyLink } from "@/components/site/copy-link";
import { NewsCard, NewsDate, NewsKindLabel } from "@/components/site/news-card";
import { NewsTimeline } from "@/components/site/news-timeline";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { getContent, getPublishedNews, getPublishedNewsBySlug, getSettings } from "@/lib/db/queries";
import { getMediaBase, getSiteUrl } from "@/lib/env";
import { paragraphs } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { linkedinShareUrl, PROJECT_STATUS_LABEL } from "@/lib/news";
import { jsonLdScript } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Rendered on first visit and then cached until the admin edits content.
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

const absolute = (url: string | null, siteUrl: string) => url && (url.startsWith("http") ? url : `${siteUrl}${url}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings, mediaBase, siteUrl] = await Promise.all([getPublishedNewsBySlug(slug), getSettings(), getMediaBase(), getSiteUrl()]);
  if (!post) return { title: "News not found" };
  // These tags make the LinkedIn preview card: headline, summary and the post's photograph.
  const image = absolute(mediaUrl(post.coverKey ?? post.project?.coverKey, mediaBase), siteUrl);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: "article",
      siteName: settings.companyName,
      title: post.title,
      description: post.summary,
      url: `${siteUrl}/news/${post.slug}`,
      publishedTime: post.postedAt.toISOString(),
      ...(image && { images: [{ url: image, alt: post.title }] }),
    },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, settings, c, mediaBase, siteUrl] = await Promise.all([
    getPublishedNewsBySlug(slug),
    getSettings(),
    getContent(),
    getMediaBase(),
    getSiteUrl(),
  ]);
  if (!post) notFound();

  const url = `${siteUrl}/news/${post.slug}`;
  const photo = post.coverKey ?? post.project?.coverKey ?? null;
  const body = paragraphs(post.body);
  const projectPage = post.project?.published && post.project.status === "completed" ? `/projects/${post.project.slug}` : null;
  const image = absolute(mediaUrl(photo, mediaBase), siteUrl);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    datePublished: post.postedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url,
    ...(image && { image: [image] }),
    publisher: { "@type": "Organization", name: settings.companyName, url: siteUrl },
  };

  // The post's own words: its summary opens the article, then its story.
  const lead = post.summary;
  const hasArticle = !!lead || body.length > 0;
  const more = (await getPublishedNews(4)).filter((p) => p.id !== post.id).slice(0, 3);
  const projectStatus = post.project ? PROJECT_STATUS_LABEL[post.project.status] : null;
  const projectFacts = (
    post.project
      ? [
          ["Type", post.project.category],
          ["Location", post.project.location],
          ["Area", post.project.areaM2 ? `${post.project.areaM2.toLocaleString("en-US")} m²` : ""],
          ["Client", post.project.client],
        ]
      : []
  ).filter(([, v]) => v) as [string, string][];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      {/* Header: a band of ink with the post's kind, date and headline */}
      <section className="bg-ink pt-10 pb-28 text-paper lg:pt-14 lg:pb-40">
        <Reveal className="container-x">
          <nav aria-label="Breadcrumb" className="text-small text-on-navy-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-paper">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/news" className="hover:text-paper">{c.newsTitle}</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="max-w-[40ch] truncate text-paper">{post.title}</li>
            </ol>
          </nav>
          <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <NewsKindLabel kind={post.kind} className="bg-paper px-4 py-2 text-ink" />
            <NewsDate date={post.postedAt} className="text-small text-paper/90" />
          </p>
          <h1 className="mt-5 max-w-4xl text-[clamp(1.875rem,1.2rem+2.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.02em]">
            {post.title}
          </h1>
        </Reveal>
      </section>

      {/* The photograph, full width of the page frame and undimmed, stepping up into the header */}
      <div className="container-x -mt-20 lg:-mt-28">
        <div className="aspect-[4/3] overflow-hidden bg-ink sm:aspect-[16/8]">
          <Photo mediaBase={mediaBase} src={photo} alt={post.title} sizes="(min-width: 1344px) 1264px, 100vw" priority className="hero-photo" />
        </div>
      </div>

      {/* The article and the project's story, beside the project card and sharing */}
      <section className="pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-12 lg:col-span-8">
            {hasArticle && (
              <Reveal>
                <article>
                  {lead && <p className="max-w-[60ch] text-[clamp(1.25rem,1.1rem+0.5vw,1.5rem)] leading-snug font-medium">{lead}</p>}
                  {body.map((p, i) => (
                    <p key={i} className={`max-w-[66ch] ${i === 0 && !lead ? "text-lead" : "mt-5"}`}>
                      {p}
                    </p>
                  ))}
                </article>
              </Reveal>
            )}

            {post.timeline.length > 1 && post.project && (
              <Reveal>
                <div className="bg-sand p-6 sm:p-8 lg:p-10">
                  <h2 className="text-lead font-semibold">{c.newsTimelineTitle}</h2>
                  <p className="mt-1 text-small text-muted">{post.project.title}</p>
                  <div className="mt-8">
                    <NewsTimeline items={post.timeline} currentId={post.id} />
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal className="lg:col-span-4">
            <div className="space-y-1 lg:sticky lg:top-24">
              {post.project && (
                <div className="bg-ink text-paper">
                  {post.project.coverKey && post.project.coverKey !== photo && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <Photo mediaBase={mediaBase} src={post.project.coverKey} alt={post.project.title} sizes="(min-width: 1024px) 30vw, 100vw" />
                    </div>
                  )}
                  <div className="p-6 lg:p-8">
                    <p className="text-small text-on-navy-muted">The project</p>
                    <p className="mt-1 text-lead font-semibold">{post.project.title}</p>
                    {projectStatus && <p className="mt-3 inline-block bg-paper px-3 py-1.5 text-small font-semibold text-ink">{projectStatus}</p>}
                    {projectFacts.length > 0 && (
                      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
                        {projectFacts.map(([k, v]) => (
                          <div key={k} className="min-w-0">
                            <dt className="text-small text-on-navy-muted">{k}</dt>
                            <dd className="mt-0.5 font-semibold break-words">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {projectPage && (
                      <Link href={projectPage} className="btn-light mt-7 w-full">
                        View the project <ArrowRightIcon width={18} height={18} />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-sand p-6 lg:p-8">
                <p className="font-semibold">Share this news</p>
                <div className="mt-4 grid gap-1">
                  <a href={linkedinShareUrl(url)} target="_blank" rel="noopener noreferrer" className="btn min-h-11 bg-[#0a66c2] px-4 text-white hover:bg-[#004182]">
                    <SocialIcon network="linkedin" width={18} height={18} /> Share on LinkedIn
                  </a>
                  <CopyLink url={url} className="btn min-h-11 bg-paper px-4 text-ink hover:bg-brand-soft" />
                </div>
                {post.linkedinPostUrl && (
                  <a href={post.linkedinPostUrl} target="_blank" rel="noopener noreferrer" className="link-arrow mt-5 flex">
                    <ExternalLinkIcon width={18} height={18} /> Read it on LinkedIn
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* More news */}
      {more.length > 0 && (
        <section className="section-y bg-sand" aria-labelledby="more-news">
          <div className="container-x">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2 id="more-news" className="text-head font-semibold">More news</h2>
              <Link href="/news" className="link-arrow">
                All news <ArrowRightIcon width={18} height={18} />
              </Link>
            </Reveal>
            <Reveal className="grid gap-x-8 gap-y-14 md:grid-cols-3" stagger={0.08}>
              {more.map((p) => (
                <NewsCard key={p.id} post={p} mediaBase={mediaBase} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

    </>
  );
}

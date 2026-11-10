import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ExternalLinkIcon, SocialIcon } from "@/components/site/icons";
import { NewsDate, NewsKindLabel } from "@/components/site/news-card";
import { NewsTimeline } from "@/components/site/news-timeline";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { getContent, getPublishedNewsBySlug, getSettings } from "@/lib/db/queries";
import { getMediaBase, getSiteUrl } from "@/lib/env";
import { paragraphs } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { linkedinShareUrl } from "@/lib/news";
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />

      <section className="relative isolate flex min-h-[420px] flex-col overflow-hidden bg-ink text-paper lg:min-h-[min(620px,calc(74svh-72px))]">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={photo} alt={post.title} sizes="100vw" priority className="hero-photo" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/65" />
        <Reveal className="container-x flex flex-1 flex-col justify-end pt-14 pb-10 lg:pb-14">
          <nav aria-label="Breadcrumb" className="text-small text-on-navy-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-paper">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/news" className="hover:text-paper">{c.newsTitle}</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="max-w-[40ch] truncate text-paper">{post.title}</li>
            </ol>
          </nav>
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <NewsKindLabel kind={post.kind} className="bg-paper px-4 py-2 text-ink" />
            <NewsDate date={post.postedAt} className="text-small text-paper/90" />
          </p>
          <h1 className="mt-4 max-w-4xl text-display font-semibold">{post.title}</h1>
          {post.summary && <p className="mt-5 max-w-2xl text-lead text-paper/90">{post.summary}</p>}
        </Reveal>
      </section>

      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            {/* The summary is already in the header; a post without a story shows just the links. */}
            {body.map((p, i) => (
              <p key={i} className={i === 0 ? "text-lead" : "mt-5"}>
                {p}
              </p>
            ))}

            <div className={`flex flex-wrap gap-3 ${body.length > 0 ? "mt-10" : ""}`}>
              {projectPage && (
                <Link href={projectPage} className="btn-primary">
                  View the project <ArrowRightIcon width={18} height={18} />
                </Link>
              )}
              <a href={linkedinShareUrl(url)} target="_blank" rel="noopener noreferrer" className="btn bg-[#0a66c2] text-white hover:bg-[#004182]">
                <SocialIcon network="linkedin" width={18} height={18} /> Share on LinkedIn
              </a>
              {post.linkedinPostUrl && (
                <a href={post.linkedinPostUrl} target="_blank" rel="noopener noreferrer" className="btn bg-sand text-ink hover:bg-brand-soft">
                  <ExternalLinkIcon width={18} height={18} /> Also on LinkedIn
                </a>
              )}
            </div>
          </Reveal>

          {post.timeline.length > 1 && post.project && (
            <Reveal className="lg:col-span-5">
              <div className="bg-sand p-6 lg:p-8">
                <h2 className="text-lead font-semibold">{c.newsTimelineTitle}</h2>
                <p className="mt-1 text-small text-muted">{post.project.title}</p>
                <div className="mt-6">
                  <NewsTimeline items={post.timeline} currentId={post.id} />
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-sand">
        <Reveal className="container-x grid gap-8 py-14 lg:grid-cols-12 lg:items-center lg:py-16">
          <div className="lg:col-span-8">
            <h2 className="text-head font-semibold">{c.newsCtaTitle}</h2>
            <p className="mt-3 max-w-xl">{c.newsCtaText}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Link href="/contact" className="btn-primary">{c.quoteButton}</Link>
            <Link href="/news" className="btn bg-paper text-ink hover:bg-brand-soft">All news</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

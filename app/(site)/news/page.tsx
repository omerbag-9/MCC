import type { Metadata } from "next";
import Link from "next/link";
import { NewsCard } from "@/components/site/news-card";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { getContent, getPublishedNews, getSettings } from "@/lib/db/queries";
import { getMediaBase } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, c] = await Promise.all([getSettings(), getContent()]);
  return {
    title: c.newsTitle,
    description: `Latest contracts, project starts and handovers from ${settings.companyName}.`,
    alternates: { canonical: "/news" },
  };
}

export default async function NewsPage() {
  const [posts, settings, c, mediaBase] = await Promise.all([getPublishedNews(), getSettings(), getContent(), getMediaBase()]);
  const heroPhoto = c.newsImage || posts.find((p) => p.coverKey)?.coverKey || settings.heroImageKey;

  return (
    <>
      <section className="relative isolate flex min-h-[360px] flex-col overflow-hidden bg-ink text-paper lg:min-h-[min(520px,calc(66svh-72px))]">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={heroPhoto} alt="" sizes="100vw" priority className="hero-photo" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/70" />
        <Reveal className="container-x flex flex-1 flex-col justify-center py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-small text-on-navy-muted">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-paper">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-paper">{c.newsTitle}</li>
            </ol>
          </nav>
          <h1 className="mt-5 text-display font-semibold">{c.newsTitle}</h1>
          <p className="mt-5 max-w-xl text-lead text-paper/90">{c.newsIntro}</p>
        </Reveal>
      </section>

      <section className="section-y">
        <div className="container-x">
          {posts.length === 0 ? (
            <p className="py-10 text-muted">{c.newsEmpty}</p>
          ) : (
            <Reveal className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {posts.map((post, i) => (
                <NewsCard key={post.id} post={post} mediaBase={mediaBase} priority={i < 3} />
              ))}
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
          <div className="lg:col-span-4 lg:justify-self-end">
            <Link href="/contact" className="btn-primary">{c.quoteButton}</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

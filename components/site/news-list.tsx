import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/site/icons";
import { NewsCard } from "@/components/site/news-card";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { getContent, getPublishedNewsPage, getSettings, NEWS_PER_PAGE } from "@/lib/db/queries";
import { getMediaBase } from "@/lib/env";

const pageHref = (n: number) => (n <= 1 ? "/news" : `/news/page/${n}`);

/** Page numbers to show: first, last, and the current one with its neighbours; null marks a gap. */
function pageList(current: number, pages: number): (number | null)[] {
  const keep = new Set([1, pages, current - 1, current, current + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...keep].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? [null, n] : [n]));
}

function Pagination({ current, pages }: { current: number; pages: number }) {
  if (pages <= 1) return null;
  const cell = "flex min-h-11 min-w-11 items-center justify-center px-3 text-[15px] font-semibold transition-colors";
  return (
    <nav aria-label="News pages" className="mt-16 flex flex-wrap items-center justify-center gap-1">
      {current > 1 ? (
        <Link href={pageHref(current - 1)} className={`${cell} gap-2 bg-sand hover:bg-brand-soft`} rel="prev">
          <ArrowRightIcon className="rotate-180" width={18} height={18} /> <span className="hidden sm:inline">Newer</span>
        </Link>
      ) : null}
      {pageList(current, pages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} className={`${cell} text-muted`} aria-hidden>
            …
          </span>
        ) : n === current ? (
          <span key={n} className={`${cell} bg-ink text-paper`} aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={pageHref(n)} className={`${cell} bg-sand hover:bg-brand-soft`} aria-label={`Page ${n}`}>
            {n}
          </Link>
        ),
      )}
      {current < pages ? (
        <Link href={pageHref(current + 1)} className={`${cell} gap-2 bg-sand hover:bg-brand-soft`} rel="next">
          <span className="hidden sm:inline">Older</span> <ArrowRightIcon width={18} height={18} />
        </Link>
      ) : null}
    </nav>
  );
}

/** The News page: header, nine posts per page with page links, and the closing call to action. */
export async function NewsList({ page }: { page: number }) {
  const [{ posts, total }, settings, c, mediaBase] = await Promise.all([getPublishedNewsPage(page), getSettings(), getContent(), getMediaBase()]);
  const pages = Math.max(1, Math.ceil(total / NEWS_PER_PAGE));
  if (page > pages) notFound();
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
          <Pagination current={page} pages={pages} />
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

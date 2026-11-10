import Link from "next/link";
import type { NewsKind } from "@/lib/db/schema";
import { formatDay, NEWS_KIND_LABEL } from "@/lib/news";
import { ArrowRightIcon, CalendarIcon, NewsKindIcon } from "./icons";
import { Photo } from "./photo";

export type NewsCardPost = {
  slug: string;
  kind: NewsKind;
  title: string;
  summary: string;
  coverKey: string | null;
  postedAt: Date;
};

/** The kind of a post, with its icon, as a label. */
export function NewsKindLabel({ kind, className = "" }: { kind: NewsKind; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-small font-semibold ${className}`}>
      <NewsKindIcon kind={kind} width={16} height={16} />
      {NEWS_KIND_LABEL[kind]}
    </span>
  );
}

export function NewsDate({ date, className = "" }: { date: Date; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <CalendarIcon width={15} height={15} />
      <time dateTime={date.toISOString().slice(0, 10)}>{formatDay(date)}</time>
    </span>
  );
}

/** A news post on a list: its photograph with the kind in the corner, the date, headline and summary. */
export function NewsCard({ post, mediaBase, priority }: { post: NewsCardPost; mediaBase: string; priority?: boolean }) {
  return (
    <Link href={`/news/${post.slug}`} className="group flex h-full flex-col">
      <div data-card-media className="relative aspect-[16/10] overflow-hidden bg-ink">
        <Photo
          mediaBase={mediaBase}
          src={post.coverKey}
          alt={post.title}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <NewsKindLabel kind={post.kind} className="absolute top-0 left-0 bg-paper px-3.5 py-2 text-ink" />
      </div>
      <NewsDate date={post.postedAt} className="mt-5 text-small text-muted" />
      <h3 className="mt-2 text-lead font-semibold transition-colors group-hover:text-ink-soft">{post.title}</h3>
      {post.summary && <p className="mt-3 max-w-[52ch]">{post.summary}</p>}
      <p className="link-arrow mt-auto pt-4">
        Read more <ArrowRightIcon width={18} height={18} className="transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </Link>
  );
}

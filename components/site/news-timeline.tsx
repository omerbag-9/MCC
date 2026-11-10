import Link from "next/link";
import type { NewsKind } from "@/lib/db/schema";
import { formatDay, NEWS_KIND_LABEL } from "@/lib/news";
import { NewsKindIcon } from "./icons";

export type TimelineItem = { id: number; slug: string; kind: NewsKind; title: string; postedAt: Date };

/**
 * A project's news from the win to the handover, oldest first, as a progress track: steps already
 * reached are filled and joined by a solid line, the post being read is ringed and marked, and the
 * steps after it are outlined and joined by a dashed line. Without a current post (the project
 * page) every step is reached and the latest is marked.
 */
export function NewsTimeline({ items, currentId, dark = false }: { items: TimelineItem[]; currentId?: number; dark?: boolean }) {
  const currentIndex = currentId ? items.findIndex((i) => i.id === currentId) : items.length - 1;
  const tone = dark
    ? { done: "bg-paper text-ink", later: "bg-transparent text-on-navy-muted ring-1 ring-inset ring-paper/40", line: "bg-paper/70", dash: "border-paper/30", ring: "ring-paper/35", muted: "text-on-navy-muted", tag: "bg-paper text-ink" }
    : { done: "bg-ink text-paper", later: "bg-paper text-muted ring-1 ring-inset ring-line", line: "bg-ink", dash: "border-ink/25", ring: "ring-ink/20", muted: "text-muted", tag: "bg-ink text-paper" };

  return (
    <ol className="relative">
      {items.map((item, i) => {
        const current = i === currentIndex;
        const reached = i <= currentIndex;
        const last = i === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-5 pb-8 last:pb-0">
            {!last &&
              (i < currentIndex ? (
                <span aria-hidden className={`absolute top-12 bottom-1 left-[23px] w-0.5 ${tone.line}`} />
              ) : (
                <span aria-hidden className={`absolute top-12 bottom-1 left-[23px] border-l-2 border-dashed ${tone.dash}`} />
              ))}
            <span
              className={`relative flex size-12 shrink-0 items-center justify-center rounded-full transition-transform ${reached ? tone.done : tone.later} ${
                current ? `ring-[6px] ${tone.ring}` : ""
              }`}
            >
              <NewsKindIcon kind={item.kind} width={24} height={24} />
            </span>
            <div className="min-w-0 pt-1">
              <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-small ${tone.muted}`}>
                <span className="font-semibold">{NEWS_KIND_LABEL[item.kind]}</span>
                <span aria-hidden>·</span>
                <time dateTime={item.postedAt.toISOString().slice(0, 10)}>{formatDay(item.postedAt)}</time>
                {current && (
                  <span className={`px-2 py-0.5 text-[12px] font-semibold ${tone.tag}`}>{currentId ? "This post" : "Latest"}</span>
                )}
              </p>
              {current && currentId ? (
                <p className="mt-1 font-semibold" aria-current="page">{item.title}</p>
              ) : (
                <Link href={`/news/${item.slug}`} className="mt-1 block font-semibold underline-offset-4 hover:underline">
                  {item.title}
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

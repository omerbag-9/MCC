import Link from "next/link";
import type { NewsKind } from "@/lib/db/schema";
import { formatDay, NEWS_KIND_LABEL } from "@/lib/news";
import { NewsKindIcon } from "./icons";

export type TimelineItem = { id: number; slug: string; kind: NewsKind; title: string; postedAt: Date };

/** A project's news from the win to the handover, oldest first, as a vertical line of steps. */
export function NewsTimeline({ items, currentId, dark = false }: { items: TimelineItem[]; currentId?: number; dark?: boolean }) {
  return (
    <ol className="relative">
      {items.map((item, i) => {
        const current = item.id === currentId;
        return (
          <li key={item.id} className="relative flex gap-4 pb-7 last:pb-0">
            {i < items.length - 1 && (
              <span aria-hidden className={`absolute top-10 bottom-0 left-[19px] w-px ${dark ? "bg-paper/25" : "bg-line"}`} />
            )}
            <span
              className={`flex size-10 shrink-0 items-center justify-center ${
                current ? (dark ? "bg-paper text-ink" : "bg-ink text-paper") : dark ? "bg-navy-2 text-paper" : "bg-sand text-ink"
              }`}
            >
              <NewsKindIcon kind={item.kind} width={19} height={19} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-small ${dark ? "text-on-navy-muted" : "text-muted"}`}>
                {NEWS_KIND_LABEL[item.kind]} · {formatDay(item.postedAt)}
              </p>
              {current ? (
                <p className="mt-0.5 font-semibold" aria-current="page">{item.title}</p>
              ) : (
                <Link href={`/news/${item.slug}`} className="mt-0.5 block font-semibold underline-offset-4 hover:underline">
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

import { NewsKindIcon } from "@/components/site/icons";
import type { NewsKind } from "@/lib/db/schema";
import { NEWS_KIND_LABEL } from "@/lib/news";

const TONE: Record<NewsKind, string> = {
  won: "bg-amber-100 text-amber-800",
  started: "bg-sky-100 text-sky-800",
  progress: "bg-gray-100 text-gray-700",
  completed: "bg-emerald-100 text-emerald-800",
  general: "bg-gray-100 text-gray-700",
};

/** The kind of a news post, with its icon. */
export function NewsBadge({ kind }: { kind: NewsKind }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[kind]}`}>
      <NewsKindIcon kind={kind} width={13} height={13} />
      {NEWS_KIND_LABEL[kind]}
    </span>
  );
}

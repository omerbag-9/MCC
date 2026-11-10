import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { NewsBadge } from "@/components/admin/news-badge";
import { Badge, EmptyState, Flash, PageHeader } from "@/components/admin/ui";
import { ContractIcon, ExcavatorIcon, HandoverIcon } from "@/components/site/icons";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { newsPosts, projects } from "@/lib/db/schema";
import { getMediaBase } from "@/lib/env";
import { mediaUrl } from "@/lib/media";
import { formatDay } from "@/lib/news";

export const metadata = { title: "News" };

export default async function NewsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [rows, mediaBase] = await Promise.all([
    db
      .select({
        id: newsPosts.id,
        kind: newsPosts.kind,
        title: newsPosts.title,
        slug: newsPosts.slug,
        coverKey: newsPosts.coverKey,
        postedAt: newsPosts.postedAt,
        published: newsPosts.published,
        project: projects.title,
      })
      .from(newsPosts)
      .leftJoin(projects, eq(newsPosts.projectId, projects.id))
      .orderBy(desc(newsPosts.postedAt), desc(newsPosts.id)),
    getMediaBase(),
  ]);

  return (
    <>
      <PageHeader
        title="News"
        action={
          <Link href="/admin/news/new" className="btn-primary py-2">
            + New post
          </Link>
        }
      />
      <Flash searchParams={await searchParams} />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { kind: "won", icon: ContractIcon, title: "Announce a win", text: "A new contract. Adds the project as “Won”." },
          { kind: "started", icon: ExcavatorIcon, title: "Work has started", text: "Moves the project to “Under construction”." },
          { kind: "completed", icon: HandoverIcon, title: "Project completed", text: "Publishes the project on the projects page." },
        ].map(({ kind, icon: Icon, title, text }) => (
          <Link key={kind} href={`/admin/news/new?kind=${kind}`} className="flex gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-line hover:ring-ink">
            <Icon width={22} height={22} className="mt-0.5 shrink-0" />
            <span>
              <span className="block font-medium">{title}</span>
              <span className="mt-0.5 block text-xs text-muted">{text}</span>
            </span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState>No news yet. Announce your latest win, or the start or handover of a project.</EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-lg bg-white shadow-sm ring-1 ring-line">
          {rows.map((n) => {
            const thumb = mediaUrl(n.coverKey?.replace(/\.(\w+)$/, "-thumb.$1"), mediaBase);
            return (
              <li key={n.id} className="flex items-center gap-4 px-4 py-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumb && <img src={thumb} alt="" className="size-full object-cover" />}
                </div>
                <Link href={`/admin/news/${n.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium hover:underline">{n.title}</p>
                  <p className="truncate text-xs text-muted">
                    {formatDay(n.postedAt)}
                    {n.project && ` · ${n.project}`}
                  </p>
                </Link>
                <div className="hidden shrink-0 gap-1.5 sm:flex">
                  <NewsBadge kind={n.kind} />
                  {!n.published && <Badge>Draft</Badge>}
                </div>
                <Link href={`/admin/news/${n.id}`} className="btn shrink-0 border border-line bg-white py-2 text-sm text-ink hover:bg-sand">
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

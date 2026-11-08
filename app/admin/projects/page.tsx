import Link from "next/link";
import { asc, desc, sql } from "drizzle-orm";
import { Badge, EmptyState, Flash, PageHeader } from "@/components/admin/ui";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { projectMedia, projects } from "@/lib/db/schema";
import { getMediaBase } from "@/lib/env";
import { mediaUrl } from "@/lib/media";

export const metadata = { title: "Projects" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [rows, mediaBase] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        category: projects.category,
        coverKey: projects.coverKey,
        published: projects.published,
        featured: projects.featured,
        sortOrder: projects.sortOrder,
        mediaCount: sql<number>`(select count(*) from ${projectMedia} where ${projectMedia.projectId} = ${projects.id})`,
      })
      .from(projects)
      .orderBy(asc(projects.sortOrder), desc(projects.id)),
    getMediaBase(),
  ]);

  return (
    <>
      <PageHeader title="Projects" action={<Link href="/admin/projects/new" className="btn-primary py-2">New project</Link>} />
      <Flash searchParams={await searchParams} />
      {rows.length === 0 ? (
        <EmptyState>No projects yet. Create your first one.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-line">
          {rows.map((p) => {
            const thumb = mediaUrl(p.coverKey?.replace(/\.(\w+)$/, "-thumb.$1"), mediaBase);
            return (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-paper">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {thumb && <img src={thumb} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted">/projects/{p.slug} · {p.mediaCount} media{p.category && ` · ${p.category}`}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                    {p.featured && <Badge tone="amber">Featured</Badge>}
                    {p.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

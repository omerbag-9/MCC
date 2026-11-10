import Link from "next/link";
import { asc, desc, sql } from "drizzle-orm";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState, Flash, PageHeader } from "@/components/admin/ui";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { projectMedia, projects } from "@/lib/db/schema";
import { getMediaBase } from "@/lib/env";
import { mediaUrl } from "@/lib/media";
import { PROJECT_STATUS_LABEL } from "@/lib/news";

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
        location: projects.location,
        coverKey: projects.coverKey,
        published: projects.published,
        status: projects.status,
        featured: projects.featured,
        mediaCount: sql<number>`(select count(*) from ${projectMedia} where ${projectMedia.projectId} = ${projects.id})`,
      })
      .from(projects)
      .orderBy(asc(projects.sortOrder), desc(projects.id)),
    getMediaBase(),
  ]);

  return (
    <>
      <PageHeader
        title="Projects"
        action={
          <Link href="/admin/projects/new" className="btn-primary py-2">
            + New project
          </Link>
        }
      />
      <Flash searchParams={await searchParams} />
      {rows.length === 0 ? (
        <EmptyState>No projects yet. Create your first one.</EmptyState>
      ) : (
        <>
          <SortableList
            kind="projects"
            noun="Project order"
            items={rows.map((p) => {
              const thumb = mediaUrl(p.coverKey?.replace(/\.(\w+)$/, "-thumb.$1"), mediaBase);
              return {
                id: p.id,
                label: p.title,
                node: (
                  <div className="flex items-center gap-4 py-3 pr-4">
                    <div className="h-14 w-20 shrink-0 overflow-hidden bg-sand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {thumb && <img src={thumb} alt="" className="size-full object-cover" />}
                    </div>
                    <Link href={`/admin/projects/${p.id}`} className="min-w-0 flex-1">
                      <p className="truncate font-medium hover:underline">{p.title}</p>
                      <p className="truncate text-xs text-muted">
                        {[p.category, p.location].filter(Boolean).join(" · ")}
                        {(p.category || p.location) && " · "}
                        {p.mediaCount} {p.mediaCount === 1 ? "photo" : "photos"}
                      </p>
                    </Link>
                    <div className="hidden shrink-0 gap-1.5 sm:flex">
                      {p.status !== "completed" && <Badge tone="amber">{PROJECT_STATUS_LABEL[p.status]}</Badge>}
                      {p.featured && <Badge tone="blue">Featured</Badge>}
                      {p.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {p.published && p.status === "completed" && (
                        <Link href={`/projects/${p.slug}`} target="_blank" className="hidden px-3 py-2 text-sm text-muted hover:bg-sand hover:text-ink md:block" title="View on site">
                          View ↗
                        </Link>
                      )}
                      <Link href={`/admin/projects/${p.id}`} className="btn border border-line bg-white py-2 text-sm text-ink hover:bg-sand">
                        Edit
                      </Link>
                    </div>
                  </div>
                ),
              };
            })}
          />
          <p className="mt-3 text-xs text-muted">
            Drag by the handle (or focus it, press Space and use the arrow keys) to change the order on the website. It saves at once.
          </p>
        </>
      )}
    </>
  );
}

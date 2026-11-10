import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EditorForm } from "@/components/admin/editor-form";
import { PhotoManager } from "@/components/admin/photo-manager";
import { ProjectFields } from "@/components/admin/project-form";
import { BackLink, Badge, Flash, PageHeader } from "@/components/admin/ui";
import { deleteProject, updateProject } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { newsPosts, projectMedia, projects } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";
import { mediaUrl } from "@/lib/media";
import { formatDay, PROJECT_STATUS_LABEL } from "@/lib/news";
import { NewsBadge } from "@/components/admin/news-badge";
import { CheckCircleIcon, HardHatIcon, ProgressIcon } from "@/components/site/icons";

export const metadata = { title: "Edit project" };

export default async function EditProject({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await ensureAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const db = await getDb();
  const [project, media, news, mediaBase, bucket] = await Promise.all([
    db.query.projects.findFirst({ where: eq(projects.id, id) }),
    db.query.projectMedia.findMany({ where: eq(projectMedia.projectId, id), orderBy: [asc(projectMedia.sortOrder), asc(projectMedia.id)] }),
    db.query.newsPosts.findMany({ where: eq(newsPosts.projectId, id), orderBy: [desc(newsPosts.postedAt), desc(newsPosts.id)] }),
    getMediaBase(),
    getMediaBucket(),
  ]);
  if (!project) notFound();

  return (
    <>
      <BackLink href="/admin/projects">All projects</BackLink>
      <PageHeader
        title={project.title}
        action={
          <div className="flex items-center gap-3">
            {project.status !== "completed" && <Badge tone="amber">{PROJECT_STATUS_LABEL[project.status]}</Badge>}
            {project.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
            {project.published && project.status === "completed" && (
              <Link href={`/projects/${project.slug}`} target="_blank" className="btn border border-line bg-white py-2 text-ink hover:bg-sand">
                View on site ↗
              </Link>
            )}
          </div>
        }
      />
      <Flash searchParams={await searchParams} />

      {/* News: the project's announcements, and the next one to post */}
      <section aria-labelledby="news-title" className="mb-8 rounded-lg bg-white p-5 shadow-sm ring-1 ring-line sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="news-title" className="text-lg font-semibold">
            News <span className="font-normal text-muted">· {PROJECT_STATUS_LABEL[project.status]}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.status === "awarded" && (
              <Link href={`/admin/news/new?kind=started&project=${project.id}`} className="btn border border-line bg-white py-2 text-sm text-ink hover:bg-sand">
                <HardHatIcon width={16} height={16} /> Announce work started
              </Link>
            )}
            {project.status !== "completed" && (
              <>
                <Link href={`/admin/news/new?kind=progress&project=${project.id}`} className="btn border border-line bg-white py-2 text-sm text-ink hover:bg-sand">
                  <ProgressIcon width={16} height={16} /> Progress update
                </Link>
                <Link href={`/admin/news/new?kind=completed&project=${project.id}`} className="btn-primary py-2 text-sm">
                  <CheckCircleIcon width={16} height={16} /> Announce completion
                </Link>
              </>
            )}
          </div>
        </div>
        {news.length > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {news.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <NewsBadge kind={n.kind} />
                <Link href={`/admin/news/${n.id}`} className="min-w-0 flex-1 truncate font-medium hover:underline">{n.title}</Link>
                <span className="text-xs text-muted">{formatDay(n.postedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No news about this project yet.</p>
        )}
      </section>

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="details-title">
          <h2 id="details-title" className="mb-3 text-lg font-semibold">Details</h2>
          <EditorForm action={updateProject.bind(null, project.id)}>
            <ProjectFields project={project} />
          </EditorForm>
        </section>

        <section id="media" aria-labelledby="media-title">
          <h2 id="media-title" className="mb-3 text-lg font-semibold">
            Photos & videos <span className="font-normal text-muted">({media.length})</span>
          </h2>
          <PhotoManager
            projectId={project.id}
            coverKey={project.coverKey}
            uploadsEnabled={!!bucket}
            media={media.map((m) => ({
              id: m.id,
              key: m.key,
              type: m.type,
              alt: m.alt,
              src: mediaUrl(m.key, mediaBase)!,
              thumb: mediaUrl(m.thumbKey ?? m.key, mediaBase)!,
            }))}
          />
        </section>
      </div>

      <form action={deleteProject.bind(null, project.id)} className="mt-12 pt-6">
        <ConfirmButton
          message={`Delete “${project.title}”?`}
          body="The project and all its photos and videos are removed from the website. This cannot be undone."
          confirmLabel="Delete project"
          className="btn px-0 text-red-700 hover:underline"
        >
          Delete project
        </ConfirmButton>
      </form>
    </>
  );
}

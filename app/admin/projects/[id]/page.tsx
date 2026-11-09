import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EditorForm } from "@/components/admin/editor-form";
import { PhotoManager } from "@/components/admin/photo-manager";
import { ProjectFields } from "@/components/admin/project-form";
import { BackLink, Badge, Flash, PageHeader } from "@/components/admin/ui";
import { deleteProject, updateProject } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { projectMedia, projects } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";
import { mediaUrl } from "@/lib/media";

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
  const [project, media, mediaBase, bucket] = await Promise.all([
    db.query.projects.findFirst({ where: eq(projects.id, id) }),
    db.query.projectMedia.findMany({ where: eq(projectMedia.projectId, id), orderBy: [asc(projectMedia.sortOrder), asc(projectMedia.id)] }),
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
            {project.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
            {project.published && (
              <Link href={`/projects/${project.slug}`} target="_blank" className="btn border border-line bg-white py-2 text-ink hover:bg-sand">
                View on site ↗
              </Link>
            )}
          </div>
        }
      />
      <Flash searchParams={await searchParams} />

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

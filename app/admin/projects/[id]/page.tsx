import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaUploader } from "@/components/admin/media-uploader";
import { ProjectForm } from "@/components/admin/project-form";
import { BackLink, Badge, Card, Flash, PageHeader } from "@/components/admin/ui";
import { deleteMedia, deleteProject, moveMedia, setCover, updateMediaAlt, updateProject } from "@/lib/actions/admin";
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
          project.published ? (
            <Link href={`/projects/${project.slug}`} target="_blank" className="text-sm text-brand-dark hover:underline">View on site ↗</Link>
          ) : (
            <Badge>Draft, not visible on the site</Badge>
          )
        }
      />
      <Flash searchParams={await searchParams} />

      <div className="grid gap-8 2xl:grid-cols-2">
        <ProjectForm project={project} action={updateProject.bind(null, project.id)} submitLabel="Save changes" />

        <section id="media" className="space-y-4">
          <h2 className="text-lg font-semibold">Photos & videos</h2>
          <MediaUploader projectId={project.id} enabled={!!bucket} />
          {media.length > 0 && (
            <ul className="space-y-3">
              {media.map((m, i) => {
                const src = mediaUrl(m.thumbKey ?? m.key, mediaBase)!;
                const isCover = project.coverKey === m.key;
                return (
                  <li key={m.id}>
                    <Card className="flex flex-col gap-4 !p-4 sm:flex-row sm:items-center">
                      <div className="h-24 w-full shrink-0 overflow-hidden rounded bg-sand sm:w-36">
                        {m.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt="" className="size-full object-cover" />
                        ) : (
                          <video src={src} className="size-full object-cover" muted preload="metadata" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone={m.type === "video" ? "blue" : "gray"}>{m.type}</Badge>
                          {isCover && <Badge tone="amber">Cover</Badge>}
                        </div>
                        <form action={updateMediaAlt.bind(null, m.id, project.id)} className="flex gap-2">
                          <input name="alt" defaultValue={m.alt} placeholder="Describe the photo (for SEO & accessibility)" className="field py-1.5" aria-label="Alt text" />
                          <button className="btn border border-line py-1.5 text-ink hover:bg-sand">Save</button>
                        </form>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        <form action={moveMedia.bind(null, m.id, project.id, "up")}>
                          <button className="btn border border-line px-3 py-1.5 text-ink hover:bg-sand disabled:opacity-30" disabled={i === 0} aria-label="Move up">↑</button>
                        </form>
                        <form action={moveMedia.bind(null, m.id, project.id, "down")}>
                          <button className="btn border border-line px-3 py-1.5 text-ink hover:bg-sand disabled:opacity-30" disabled={i === media.length - 1} aria-label="Move down">↓</button>
                        </form>
                        {m.type === "image" && !isCover && (
                          <form action={setCover.bind(null, m.id, project.id)}>
                            <button className="btn border border-line px-3 py-1.5 text-ink hover:bg-sand">Set cover</button>
                          </form>
                        )}
                        <form action={deleteMedia.bind(null, m.id, project.id)}>
                          <ConfirmButton message="Delete this file?" className="btn px-3 py-1.5 text-red-700 hover:bg-red-50">Delete</ConfirmButton>
                        </form>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <form action={deleteProject.bind(null, project.id)} className="mt-12 border-t border-line pt-6">
        <ConfirmButton message="Delete this project and all its photos and videos? This cannot be undone." className="btn text-red-700 hover:bg-red-50">
          Delete project
        </ConfirmButton>
      </form>
    </>
  );
}

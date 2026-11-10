import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EditorForm } from "@/components/admin/editor-form";
import { LinkedInShare } from "@/components/admin/linkedin-share";
import { NewsBadge } from "@/components/admin/news-badge";
import { NewsFields } from "@/components/admin/news-form";
import { BackLink, Badge, Flash, PageHeader } from "@/components/admin/ui";
import { deleteNews, updateNews } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { newsPosts, projects } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket, getSiteUrl } from "@/lib/env";

export const metadata = { title: "Edit post" };

export default async function EditNews({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await ensureAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const query = await searchParams;
  const db = await getDb();
  const [post, projectList, mediaBase, bucket, siteUrl] = await Promise.all([
    db.query.newsPosts.findFirst({ where: eq(newsPosts.id, id) }),
    db.select({ id: projects.id, title: projects.title, status: projects.status }).from(projects).orderBy(desc(projects.id)),
    getMediaBase(),
    getMediaBucket(),
    getSiteUrl(),
  ]);
  if (!post) notFound();

  const url = `${siteUrl}/news/${post.slug}`;
  const caption = [post.title, post.summary, `Read more: ${url}`].filter(Boolean).join("\n\n");

  return (
    <>
      <BackLink href="/admin/news">All news</BackLink>
      <PageHeader
        title={post.title}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <NewsBadge kind={post.kind} />
            {post.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
            {post.published && (
              <Link href={`/news/${post.slug}`} target="_blank" className="btn border border-line bg-white py-2 text-ink hover:bg-sand">
                View on site ↗
              </Link>
            )}
          </div>
        }
      />
      <Flash searchParams={query} />

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <section aria-label="Post" className={query.share && post.published ? "order-2 2xl:order-1" : ""}>
          <EditorForm action={updateNews.bind(null, post.id)}>
            <NewsFields post={post} projects={projectList} kind={post.kind} projectId={post.projectId} mediaBase={mediaBase} uploadsEnabled={!!bucket} />
          </EditorForm>
        </section>
        <aside className="order-1 space-y-4 2xl:order-2">
          {post.published ? (
            <LinkedInShare url={url} caption={caption} highlight={!!query.share} />
          ) : (
            <p className="rounded-lg bg-white p-5 text-sm text-muted ring-1 ring-line">Publish the post to share it on LinkedIn.</p>
          )}
          {post.projectId && (
            <p className="text-sm">
              <Link href={`/admin/projects/${post.projectId}`} className="font-medium underline-offset-4 hover:underline">
                Open the project →
              </Link>
            </p>
          )}
        </aside>
      </div>

      <form action={deleteNews.bind(null, post.id)} className="mt-12 pt-6">
        <ConfirmButton
          message={`Delete “${post.title}”?`}
          body="The post is removed from the website. The project stays. This cannot be undone."
          confirmLabel="Delete post"
          className="btn px-0 text-red-700 hover:underline"
        >
          Delete post
        </ConfirmButton>
      </form>
    </>
  );
}

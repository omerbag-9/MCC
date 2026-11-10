import { desc } from "drizzle-orm";
import { NewsFields } from "@/components/admin/news-form";
import { BackLink, Flash, PageHeader } from "@/components/admin/ui";
import { createNews } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { NEWS_KINDS, type NewsKind, projects } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";

export const metadata = { title: "New post" };

export default async function NewNews({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const params = await searchParams;
  const kind: NewsKind = NEWS_KINDS.includes(params.kind as NewsKind) ? (params.kind as NewsKind) : "won";
  const projectId = Number(params.project) || null;
  const db = await getDb();
  const [projectList, mediaBase, bucket] = await Promise.all([
    db.select({ id: projects.id, title: projects.title, status: projects.status }).from(projects).orderBy(desc(projects.id)),
    getMediaBase(),
    getMediaBucket(),
  ]);

  return (
    <>
      <BackLink href="/admin/news">All news</BackLink>
      <PageHeader title="New post" />
      <Flash searchParams={params} />
      <form action={createNews} className="max-w-3xl space-y-6">
        <NewsFields projects={projectList} kind={kind} projectId={projectId} mediaBase={mediaBase} uploadsEnabled={!!bucket} />
        <button className="btn-primary">Publish post</button>
      </form>
    </>
  );
}

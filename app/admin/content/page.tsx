import Link from "next/link";
import { ContentFields } from "@/components/admin/content-fields";
import { EditorForm } from "@/components/admin/editor-form";
import { Card, Flash, PageHeader } from "@/components/admin/ui";
import { saveContent } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { CONTENT_GROUPS } from "@/lib/content";
import { getDb } from "@/lib/db/client";
import { getMediaBase, getMediaBucket } from "@/lib/env";

export const metadata = { title: "Website content" };

export default async function ContentAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [row, mediaBase, bucket] = await Promise.all([db.query.settings.findFirst(), getMediaBase(), getMediaBucket()]);
  const saved = row?.content ?? {};

  return (
    <>
      <PageHeader title="Website content" />
      <p className="-mt-3 mb-6 max-w-3xl text-sm text-muted">
        Headings, texts, buttons, photos and which sections are shown on each page. A text left empty shows the
        wording in grey. Write <code>{"{company}"}</code> to insert the company name.
      </p>
      <Flash searchParams={await searchParams} />

      <EditorForm action={saveContent} className="max-w-3xl space-y-8">
        {CONTENT_GROUPS.map((g) => (
          <section key={g.id} id={g.id}>
            <h2 className="mb-1 font-semibold">{g.title}</h2>
            {g.adminPage ? (
              <Card>
                <p className="text-sm text-muted">
                  Edited with the section itself, in{" "}
                  <Link href={g.adminPage} className="font-medium text-ink underline underline-offset-4">
                    {g.title.replace(/ section$/, "")}
                  </Link>
                  .
                </p>
              </Card>
            ) : (
              <>
                {g.description && <p className="mb-3 text-sm text-muted">{g.description}</p>}
                <ContentFields group={g} saved={saved} mediaBase={mediaBase} uploads={!!bucket} />
              </>
            )}
          </section>
        ))}
      </EditorForm>
    </>
  );
}

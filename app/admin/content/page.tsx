import { EditorForm } from "@/components/admin/editor-form";
import { PageTabs } from "@/components/admin/page-tabs";
import { SectionCard } from "@/components/admin/section-card";
import { Flash, PageHeader } from "@/components/admin/ui";
import { saveContent } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { CONTENT_PAGES } from "@/lib/content";
import { getDb } from "@/lib/db/client";
import { DEFAULT_SETTINGS } from "@/lib/db/queries";
import { getMediaBase, getMediaBucket } from "@/lib/env";

export const metadata = { title: "Website content" };

export default async function ContentAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const params = await searchParams;
  const db = await getDb();
  const [row, mediaBase, bucket] = await Promise.all([db.query.settings.findFirst(), getMediaBase(), getMediaBucket()]);
  const settings = row ?? DEFAULT_SETTINGS;
  const saved = settings.content ?? {};
  const uploads = !!bucket;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Website content" />
      <p className="-mt-3 mb-4 max-w-3xl text-sm text-muted">
        Everything the website&apos;s pages say and show, page by page and section by section, in the order visitors see
        them. A text left empty shows the default wording in grey. Write <code>{"{company}"}</code> for the company name.
        Edits on several tabs are saved together.
      </p>
      <Flash searchParams={params} />

      <EditorForm action={saveContent}>
        <PageTabs
          initial={params.page ?? "home"}
          tabs={CONTENT_PAGES.map((page) => ({
            id: page.id,
            title: page.title,
            content: (
              <div className="space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <div>
                    <h2 className="text-lg font-semibold">{page.title}</h2>
                    {page.description && <p className="text-sm text-muted">{page.description}</p>}
                  </div>
                  <a href={page.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
                    Open the page ↗
                  </a>
                </div>
                {page.sections.length > 3 && (
                  <nav aria-label={`Sections of the ${page.title.toLowerCase()}`} className="flex flex-wrap gap-2 text-sm">
                    {page.sections.map((s, i) => (
                      <a key={s.id} href={`#sec-${s.id}`} className="rounded-full bg-white px-3 py-1 text-muted ring-1 ring-line hover:text-ink hover:ring-ink/30">
                        <span className="tabular-nums text-muted/70">{i + 1}.</span> {s.title}
                      </a>
                    ))}
                  </nav>
                )}
                {page.sections.map((s) => (
                  <SectionCard key={s.id} section={s} settings={settings} saved={saved} mediaBase={mediaBase} uploads={uploads} />
                ))}
              </div>
            ),
          }))}
        />
      </EditorForm>
    </div>
  );
}

import { EditorForm } from "@/components/admin/editor-form";
import { ImageField } from "@/components/admin/image-field";
import { Card, Checkbox, Flash, PageHeader, TextArea, TextField } from "@/components/admin/ui";
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
            {g.description && <p className="mb-3 text-sm text-muted">{g.description}</p>}
            <Card className="space-y-5">
              {g.fields.map((f) => {
                const name = `c_${f.key}`;
                const value = saved[f.key];
                if (f.kind === "toggle")
                  return <Checkbox key={f.key} name={name} label={f.label} defaultChecked={(value ?? f.default) === "1"} />;
                if (f.kind === "image")
                  return (
                    <ImageField key={f.key} name={name} label={f.label} folder="site" defaultKey={value || null} mediaBase={mediaBase} enabled={!!bucket} hint={f.hint} />
                  );
                if (f.kind === "textarea")
                  return <TextArea key={f.key} name={name} label={f.label} defaultValue={value ?? ""} placeholder={f.default} rows={3} hint={f.hint} />;
                return <TextField key={f.key} name={name} label={f.label} defaultValue={value ?? ""} placeholder={f.default} hint={f.hint} />;
              })}
            </Card>
          </section>
        ))}
      </EditorForm>
    </>
  );
}

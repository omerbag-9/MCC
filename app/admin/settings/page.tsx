import Link from "next/link";
import { EditorForm } from "@/components/admin/editor-form";
import { Card, Flash, PageHeader, TextArea, TextField } from "@/components/admin/ui";
import { saveSettings } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/db/queries";
import { getDb } from "@/lib/db/client";

export const metadata = { title: "Site settings" };

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const row = await db.query.settings.findFirst();
  const s = row ?? DEFAULT_SETTINGS;

  return (
    <>
      <PageHeader title="Site settings" />
      <p className="-mt-3 mb-6 max-w-3xl text-sm text-muted">
        Company details used across the whole website. What each page says and shows (the home page&apos;s title, photos,
        figures and sections) is in{" "}
        <Link href="/admin/content" className="font-medium text-ink underline underline-offset-4">Website content</Link>.
      </p>
      <Flash searchParams={await searchParams} />

      <EditorForm action={saveSettings} className="max-w-3xl space-y-8">
        <section id="company" className="scroll-mt-6">
          <h2 className="mb-3 font-semibold">Company</h2>
          <Card className="grid gap-5 sm:grid-cols-2">
            <TextField name="companyName" label="Company name" defaultValue={s.companyName} required />
            <TextField name="tagline" label="Tagline" defaultValue={s.tagline} hint="Small text above the hero title and in the footer." />
          </Card>
        </section>

        <section id="contact" className="scroll-mt-6">
          <h2 className="mb-1 font-semibold">Contact</h2>
          <p className="mb-3 text-sm text-muted">Shown in the top bar, the footer, the home page&apos;s contact section and the contact page.</p>
          <Card className="grid gap-5 sm:grid-cols-2">
            <TextField name="phone" label="Phone" defaultValue={s.phone} />
            <TextField name="email" label="Email" type="email" defaultValue={s.email} />
            <div className="sm:col-span-2">
              <TextField name="address" label="Address" defaultValue={s.address} />
            </div>
            <TextField name="workingHours" label="Working hours" defaultValue={s.workingHours} placeholder="Sat–Thu, 9:00–17:00" />
            <div className="sm:col-span-2">
              <TextArea
                name="mapEmbedUrl"
                label="Map on the contact page"
                defaultValue={s.mapEmbedUrl}
                rows={3}
                hint="In Google Maps, open MCC CONSTRUCTION → Share → Embed a map → Copy HTML, and paste it here as it is. The map shows at the foot of the contact page, and the address everywhere on the site opens the same place."
              />
            </div>
          </Card>
        </section>

        <section id="social" className="scroll-mt-6">
          <h2 className="mb-1 font-semibold">Social media</h2>
          <p className="mb-3 text-sm text-muted">Icons in the top bar and the footer, for the links filled in.</p>
          <Card className="grid gap-5 sm:grid-cols-2">
            <TextField name="facebookUrl" label="Facebook" type="url" defaultValue={s.facebookUrl} />
            <TextField name="instagramUrl" label="Instagram" type="url" defaultValue={s.instagramUrl} />
            <TextField name="linkedinUrl" label="LinkedIn" type="url" defaultValue={s.linkedinUrl} />
            <TextField name="youtubeUrl" label="YouTube" type="url" defaultValue={s.youtubeUrl} />
            <TextField name="tiktokUrl" label="TikTok" type="url" defaultValue={s.tiktokUrl} />
          </Card>
        </section>

        <section id="seo" className="scroll-mt-6">
          <h2 className="mb-1 font-semibold">Search engines</h2>
          <p className="mb-3 text-sm text-muted">How the site appears in Google results and browser tabs.</p>
          <Card className="space-y-5">
            <TextField name="seoTitle" label="Site title" defaultValue={s.seoTitle} hint="Shown in Google and browser tabs. Defaults to the company name." />
            <TextArea name="seoDescription" label="Site description" defaultValue={s.seoDescription} rows={2} hint="~150 characters. Defaults to the hero subtitle." />
          </Card>
        </section>

      </EditorForm>
    </>
  );
}

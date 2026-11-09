import { EditorForm } from "@/components/admin/editor-form";
import { ImageField } from "@/components/admin/image-field";
import { Card, Flash, PageHeader, TextArea, TextField } from "@/components/admin/ui";
import { saveSettings } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/db/queries";
import { getDb } from "@/lib/db/client";
import { getMediaBase, getMediaBucket } from "@/lib/env";

export const metadata = { title: "Settings" };

const STAT_HINTS = [
  ["EGP 4.2B", "Total revenue"],
  ["350+", "Projects completed"],
  ["25+", "Years of experience"],
];

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [row, mediaBase, bucket] = await Promise.all([db.query.settings.findFirst(), getMediaBase(), getMediaBucket()]);
  const s = row ?? DEFAULT_SETTINGS;
  const stats = [...s.stats, ...Array(3).fill({ value: "", label: "" })].slice(0, 3) as { value: string; label: string }[];

  return (
    <>
      <PageHeader title="Settings" />
      <Flash searchParams={await searchParams} />

      <EditorForm action={saveSettings} className="max-w-3xl space-y-8">
        <section>
          <h2 className="mb-3 font-semibold">Company</h2>
          <Card className="grid gap-5 sm:grid-cols-2">
            <TextField name="companyName" label="Company name" defaultValue={s.companyName} required />
            <TextField name="tagline" label="Tagline" defaultValue={s.tagline} hint="Small text above the hero title and in the footer." />
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Home page</h2>
          <Card className="space-y-5">
            <TextField name="heroTitle" label="Hero title" defaultValue={s.heroTitle} hint="Keep it short, about 35 characters, so it fits on two lines on phones." />
            <TextArea name="heroSubtitle" label="Hero subtitle" defaultValue={s.heroSubtitle} rows={2} />
            <ImageField name="heroImageKey" label="Hero background image" folder="site" defaultKey={s.heroImageKey} mediaBase={mediaBase} enabled={!!bucket} hint="Wide photo, at least 1920px. Shown while the video loads, and instead of it when there is none. If empty, the first featured project's cover is used." />
            <ImageField kind="video" name="heroVideoKey" label="Hero background video" folder="site" defaultKey={s.heroVideoKey} mediaBase={mediaBase} enabled={!!bucket} hint="MP4 or WebM, 10–30 seconds, 1080p or 720p, ideally under 15 MB. Plays muted on a loop; sound is removed by the browser." />
            <div>
              <span className="label">Figures under the hero (3)</span>
              <div className="grid gap-3">
                {stats.map((st, i) => (
                  <div key={i} className="flex gap-2">
                    <input name={`stat_value_${i}`} defaultValue={st.value} placeholder={STAT_HINTS[i][0]} aria-label={`Figure ${i + 1} value`} className="field w-36" />
                    <input name={`stat_label_${i}`} defaultValue={st.label} placeholder={STAT_HINTS[i][1]} aria-label={`Figure ${i + 1} label`} className="field" />
                  </div>
                ))}
              </div>
            </div>
            <TextField name="aboutTitle" label="About section title" defaultValue={s.aboutTitle} />
            <TextArea name="aboutBody" label="About section text" defaultValue={s.aboutBody} rows={6} hint="Separate paragraphs with an empty line." />
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Contact & WhatsApp</h2>
          <Card className="grid gap-5 sm:grid-cols-2">
            <TextField name="phone" label="Phone" defaultValue={s.phone} />
            <TextField name="email" label="Email" type="email" defaultValue={s.email} />
            <TextField name="whatsappNumber" label="WhatsApp number" defaultValue={s.whatsappNumber} hint="International format with country code, e.g. 201001234567. Leave empty to hide WhatsApp buttons." />
            <TextField name="whatsappMessage" label="Default WhatsApp message" defaultValue={s.whatsappMessage} />
            <div className="sm:col-span-2">
              <TextField name="address" label="Address" defaultValue={s.address} />
            </div>
            <TextField name="workingHours" label="Working hours" defaultValue={s.workingHours} placeholder="Sat–Thu, 9:00–17:00" />
            <TextField name="mapEmbedUrl" label="Google Maps embed URL" defaultValue={s.mapEmbedUrl} hint="Google Maps → Share → Embed a map → copy the src=&quot;…&quot; link." />
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Social media</h2>
          <Card className="grid gap-5 sm:grid-cols-2">
            <TextField name="facebookUrl" label="Facebook" type="url" defaultValue={s.facebookUrl} />
            <TextField name="instagramUrl" label="Instagram" type="url" defaultValue={s.instagramUrl} />
            <TextField name="linkedinUrl" label="LinkedIn" type="url" defaultValue={s.linkedinUrl} />
            <TextField name="youtubeUrl" label="YouTube" type="url" defaultValue={s.youtubeUrl} />
            <TextField name="tiktokUrl" label="TikTok" type="url" defaultValue={s.tiktokUrl} />
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">SEO</h2>
          <Card className="space-y-5">
            <TextField name="seoTitle" label="Site title" defaultValue={s.seoTitle} hint="Shown in Google and browser tabs. Defaults to the company name." />
            <TextArea name="seoDescription" label="Site description" defaultValue={s.seoDescription} rows={2} hint="~150 characters. Defaults to the hero subtitle." />
          </Card>
        </section>

      </EditorForm>
    </>
  );
}

import type { FieldItem } from "@/components/admin/content-fields";
import { ImageField } from "@/components/admin/image-field";
import { TextArea, TextField } from "@/components/admin/ui";
import type { SettingsFieldKey } from "@/lib/content";
import type { Settings } from "@/lib/db/schema";

const STAT_HINTS = [
  ["EGP 80M", "Total revenue"],
  ["30+", "Projects completed"],
  ["10+", "Years of experience"],
];

/** A Site settings column as a form control inside a Website content section (saved by its name). */
export function settingsItem(key: SettingsFieldKey, s: Settings, mediaBase: string, uploads: boolean): FieldItem {
  const stats = [...s.stats, ...Array(3).fill({ value: "", label: "" })].slice(0, 3) as { value: string; label: string }[];
  switch (key) {
    case "heroTitle":
      return {
        key,
        kind: "wide",
        node: <TextField name="heroTitle" label="Title" defaultValue={s.heroTitle} placeholder={s.companyName} hint="Keep it short, about 35 characters, so it fits on two lines on phones." />,
      };
    case "heroSubtitle":
      return { key, kind: "wide", node: <TextArea name="heroSubtitle" label="Text under the title" defaultValue={s.heroSubtitle} rows={2} /> };
    case "heroImageKey":
      return {
        key,
        kind: "image",
        node: (
          <ImageField
            name="heroImageKey"
            label="Background photo"
            path="site/hero"
            defaultKey={s.heroImageKey}
            mediaBase={mediaBase}
            enabled={uploads}
            hint="Wide, at least 1920px. Shown while the video loads, or instead of it. Empty: the first featured project's cover."
          />
        ),
      };
    case "heroVideoKey":
      return {
        key,
        kind: "image",
        node: (
          <ImageField
            kind="video"
            name="heroVideoKey"
            label="Background video"
            path="site/hero"
            defaultKey={s.heroVideoKey}
            mediaBase={mediaBase}
            enabled={uploads}
            hint="MP4 or WebM, 10–30 seconds, under 15 MB. Plays muted on a loop."
          />
        ),
      };
    case "stats":
      return {
        key,
        kind: "wide",
        node: (
          <div>
            <span className="label">The three figures</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {stats.map((st, i) => (
                <div key={i} className="grid gap-1.5 rounded-md bg-sand p-2">
                  <input name={`stat_value_${i}`} defaultValue={st.value} placeholder={STAT_HINTS[i][0]} aria-label={`Figure ${i + 1}: number`} className="field font-semibold" />
                  <input name={`stat_label_${i}`} defaultValue={st.label} placeholder={STAT_HINTS[i][1]} aria-label={`Figure ${i + 1}: what it counts`} className="field" />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">Each figure: a number, and what it counts underneath. A figure with either part empty is not shown.</p>
          </div>
        ),
      };
    case "aboutTitle":
      return { key, kind: "wide", node: <TextField name="aboutTitle" label="Heading" defaultValue={s.aboutTitle} placeholder={`About ${s.companyName}`} /> };
    case "aboutBody":
      return { key, kind: "wide", node: <TextArea name="aboutBody" label="Text" defaultValue={s.aboutBody} rows={6} hint="Separate paragraphs with an empty line." /> };
    case "strengths":
      return {
        key,
        kind: "wide",
        node: <TextArea name="strengths" label="The points" defaultValue={s.strengths} rows={6} hint="One point per line, about 3–6 words each; six works best. Each gets a matching icon." />,
      };
  }
}

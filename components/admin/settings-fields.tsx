import type { FieldItem } from "@/components/admin/content-fields";
import { HeroSlidesField } from "@/components/admin/hero-slides-field";
import { ImageField } from "@/components/admin/image-field";
import { TextArea, TextField } from "@/components/admin/ui";
import type { SettingsFieldKey } from "@/lib/content";
import type { HeroMode, Settings } from "@/lib/db/schema";
import { heroModeOf } from "@/lib/hero";

const STAT_HINTS = [
  ["EGP 80M", "Total revenue"],
  ["30+", "Projects completed"],
  ["10+", "Years of experience"],
];

const HERO_MODES: { mode: HeroMode; title: string; text: string }[] = [
  { mode: "photo", title: "One photo", text: "A still photo with a slow settle." },
  { mode: "video", title: "Video", text: "A muted video on a loop." },
  { mode: "slideshow", title: "Slideshow", text: "Several photos that change by themselves." },
];

/** Extra data some fields need besides the settings row. */
export type SettingsItemData = {
  /** The photos the hero slideshow shows while none is chosen (the hero photo, featured covers). */
  heroFallback?: string[];
};

/**
 * A field shown only for some of the hero choices: globals.css hides it while another choice is
 * ticked in the same form.
 */
function heroOnly(modes: HeroMode[], node: React.ReactNode) {
  return <div data-hero-only={modes.join(" ")}>{node}</div>;
}

/** A Site settings column as a form control inside a Website content section (saved by its name). */
export function settingsItem(key: SettingsFieldKey, s: Settings, mediaBase: string, uploads: boolean, data: SettingsItemData = {}): FieldItem {
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
    case "heroMode": {
      const current = heroModeOf(s);
      return {
        key,
        kind: "wide",
        node: (
          <fieldset>
            <legend className="label">Behind the title</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {HERO_MODES.map((m) => (
                <label
                  key={m.mode}
                  className="flex cursor-pointer gap-3 rounded-md bg-white p-3 ring-1 ring-line hover:ring-ink/40 has-[:checked]:bg-sand has-[:checked]:ring-2 has-[:checked]:ring-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink/40"
                >
                  <input type="radio" name="heroMode" value={m.mode} defaultChecked={current === m.mode} className="mt-1 accent-ink" />
                  <span>
                    <span className="block font-medium">{m.title}</span>
                    <span className="block text-sm text-muted">{m.text}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">Only the fields of the chosen one are shown below. The others keep what they hold, so you can switch back.</p>
          </fieldset>
        ),
      };
    }
    case "heroSlides":
      return {
        key,
        kind: "wide",
        node: heroOnly(
          ["slideshow"],
          <HeroSlidesField defaultKeys={s.heroSlides} defaultSeconds={s.heroSlideSeconds} fallbackKeys={data.heroFallback ?? []} mediaBase={mediaBase} enabled={uploads} />,
        ),
      };
    case "heroImageKey":
      return {
        key,
        kind: "image",
        node: heroOnly(
          ["photo", "video"],
          <ImageField
            name="heroImageKey"
            label="Background photo"
            path="site/hero"
            defaultKey={s.heroImageKey}
            mediaBase={mediaBase}
            enabled={uploads}
            hint="Wide, at least 1920px. With the video, shown while it loads. Empty: the first featured project's cover."
          />,
        ),
      };
    case "heroVideoKey":
      return {
        key,
        kind: "image",
        node: heroOnly(
          ["video"],
          <ImageField
            kind="video"
            name="heroVideoKey"
            label="Background video"
            path="site/hero"
            defaultKey={s.heroVideoKey}
            mediaBase={mediaBase}
            enabled={uploads}
            hint="MP4 or WebM, 10–30 seconds, under 15 MB. Plays muted on a loop."
          />,
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

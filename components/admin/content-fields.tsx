import { ImageField } from "@/components/admin/image-field";
import { Checkbox, TextArea, TextField } from "@/components/admin/ui";
import { isRetiredDefault, type ContentField, type ContentSection } from "@/lib/content";
import { slugify } from "@/lib/format";

/** One field of a form grid: short texts and photos can sit two to a row, the rest take a row. */
export type FieldItem = { key: string; kind: "text" | "image" | "wide"; node: React.ReactNode };

/** Lays fields out in two columns: two short texts, or two photos, in a row; anything else alone. */
export function FieldGrid({ items }: { items: FieldItem[] }) {
  const half = items.map(() => false);
  for (let i = 0; i + 1 < items.length; i++) {
    if (items[i].kind !== "wide" && items[i].kind === items[i + 1].kind) {
      half[i] = half[i + 1] = true;
      i++;
    }
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={it.key} className={half[i] ? "min-w-0" : "min-w-0 sm:col-span-2"}>
          {it.node}
        </div>
      ))}
    </div>
  );
}

/** A Website content field as a form control. An empty text shows the default wording in grey. */
export function contentItem(f: ContentField, saved: Record<string, string>, mediaBase: string, uploads: boolean): FieldItem {
  const name = `c_${f.key}`;
  const value = isRetiredDefault(f.key, saved[f.key]) ? undefined : saved[f.key];
  if (f.kind === "toggle") return { key: f.key, kind: "wide", node: <Checkbox name={name} label={f.label} defaultChecked={(value ?? f.default) === "1"} /> };
  if (f.kind === "image")
    return {
      key: f.key,
      kind: "image",
      node: (
        <ImageField
          name={name}
          label={f.label}
          path={`site/pages/${slugify(f.key.replace(/([a-z])([A-Z])/g, "$1-$2"))}`}
          defaultKey={value || null}
          mediaBase={mediaBase}
          enabled={uploads}
          hint={f.hint}
        />
      ),
    };
  if (f.kind === "textarea") {
    const text = value || f.default;
    const rows = Math.min(10, Math.max(3, Math.ceil(text.length / 90) + text.split("\n").length));
    return { key: f.key, kind: "wide", node: <TextArea name={name} label={f.label} defaultValue={value ?? ""} placeholder={f.default} rows={rows} hint={f.hint} /> };
  }
  return { key: f.key, kind: "text", node: <TextField name={name} label={f.label} defaultValue={value ?? ""} placeholder={f.default} hint={f.hint} /> };
}

/**
 * All the fields of one Website content section, for a form that saves with saveContent (used
 * where a section is edited beside its items, like Admin → Project facts). The hidden input names
 * the section, so saving only changes the sections that were on the form.
 */
export function ContentFields({
  section,
  saved,
  mediaBase,
  uploads,
}: {
  section: ContentSection;
  saved: Record<string, string>;
  mediaBase: string;
  uploads: boolean;
}) {
  return (
    <>
      <input type="hidden" name="c__groups" value={section.id} />
      <FieldGrid items={section.fields.map((f) => contentItem(f, saved, mediaBase, uploads))} />
    </>
  );
}

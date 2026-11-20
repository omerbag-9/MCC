import { ImageField } from "@/components/admin/image-field";
import { Card, Checkbox, TextArea, TextField } from "@/components/admin/ui";
import { isRetiredDefault, type ContentGroup } from "@/lib/content";
import { slugify } from "@/lib/format";

/**
 * The fields of one Website content group, for a form that saves with saveContent. The hidden
 * input names the group, so saving only changes the groups that were on the form.
 */
export function ContentFields({
  group,
  saved,
  mediaBase,
  uploads,
}: {
  group: ContentGroup;
  saved: Record<string, string>;
  mediaBase: string;
  uploads: boolean;
}) {
  return (
    <Card className="space-y-5">
      <input type="hidden" name="c__groups" value={group.id} />
      {group.fields.map((f) => {
        const name = `c_${f.key}`;
        const value = isRetiredDefault(f.key, saved[f.key]) ? undefined : saved[f.key];
        if (f.kind === "toggle") return <Checkbox key={f.key} name={name} label={f.label} defaultChecked={(value ?? f.default) === "1"} />;
        if (f.kind === "image")
          return (
            <ImageField
              key={f.key}
              name={name}
              label={f.label}
              path={`site/pages/${slugify(f.key.replace(/([a-z])([A-Z])/g, "$1-$2"))}`}
              defaultKey={value || null}
              mediaBase={mediaBase}
              enabled={uploads}
              hint={f.hint}
            />
          );
        if (f.kind === "textarea")
          return <TextArea key={f.key} name={name} label={f.label} defaultValue={value ?? ""} placeholder={f.default} rows={3} hint={f.hint} />;
        return <TextField key={f.key} name={name} label={f.label} defaultValue={value ?? ""} placeholder={f.default} hint={f.hint} />;
      })}
    </Card>
  );
}

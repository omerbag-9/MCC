import Link from "next/link";
import { contentItem, FieldGrid, type FieldItem } from "@/components/admin/content-fields";
import { settingsItem } from "@/components/admin/settings-fields";
import type { ContentSection, SettingsFieldKey } from "@/lib/content";
import type { Settings } from "@/lib/db/schema";

/**
 * One section of a website page in Admin → Website content: its name, where it is, a switch that
 * shows or hides it (the card fades while it is hidden), its fields, and links to what it shows
 * that is managed on another admin page.
 */
export function SectionCard({
  section,
  settings,
  saved,
  mediaBase,
  uploads,
}: {
  section: ContentSection;
  settings: Settings;
  saved: Record<string, string>;
  mediaBase: string;
  uploads: boolean;
}) {
  const toggle = section.toggle ? section.fields.find((f) => f.key === section.toggle) : undefined;
  const shown = toggle ? saved[toggle.key] !== "0" : true;

  // The card's fields in the order they appear on the site: its own and the Site settings ones.
  const own = section.fields.filter((f) => f.key !== section.toggle);
  // A field missing from the layout is still shown (saving the section writes every field of it).
  const all = [...(section.settings ?? []), ...own.map((f) => f.key)];
  const order = section.layout ? [...section.layout, ...all.filter((k) => !section.layout!.includes(k))] : all;
  const items: FieldItem[] = order.flatMap((key) => {
    if (section.settings?.includes(key as SettingsFieldKey)) return [settingsItem(key as SettingsFieldKey, settings, mediaBase, uploads)];
    const f = own.find((x) => x.key === key);
    return f ? [contentItem(f, saved, mediaBase, uploads)] : [];
  });

  return (
    <section
      id={`sec-${section.id}`}
      aria-labelledby={`sec-${section.id}-title`}
      className="scroll-mt-28 rounded-lg bg-white ring-1 ring-line [&:has([data-toggle]:not(:checked))_[data-body]]:opacity-45 [&:has([data-toggle]:not(:checked))_[data-hidden-note]]:inline-flex"
    >
      <header className="flex flex-wrap items-start gap-x-6 gap-y-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1 basis-64">
          <h3 id={`sec-${section.id}-title`} className="flex items-center gap-2 font-semibold">
            {section.title}
            <span data-hidden-note className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Hidden on the website
            </span>
          </h3>
          {section.description && <p className="mt-0.5 text-sm text-muted">{section.description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {section.anchor && (
            <a href={section.anchor} target="_blank" rel="noopener noreferrer" className="text-sm whitespace-nowrap text-muted underline-offset-4 hover:text-ink hover:underline">
              View on site ↗
            </a>
          )}
          {toggle && section.adminPage && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${shown ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
              {shown ? "Shown" : "Hidden"}
            </span>
          )}
          {toggle && !section.adminPage && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
              <input type="checkbox" name={`c_${toggle.key}`} defaultChecked={shown} data-toggle className="peer sr-only" aria-label={toggle.label} />
              <span
                aria-hidden
                className="relative h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
              />
              <span className="w-12 peer-checked:hidden">Hidden</span>
              <span className="hidden w-12 peer-checked:inline">Shown</span>
            </label>
          )}
        </div>
      </header>

      <div data-body className="space-y-5 px-5 py-5 transition-opacity sm:px-6">
        {section.adminPage ? (
          <p className="text-sm">
            This section has its own page, where its heading, its tabs and their facts, photos and buttons are edited together.{" "}
            <Link href={section.adminPage} className="font-medium text-ink underline underline-offset-4">
              Open {section.title} →
            </Link>
          </p>
        ) : (
          <>
            <input type="hidden" name="c__groups" value={section.id} />
            {items.length > 0 && <FieldGrid items={items} />}
          </>
        )}
        {section.elsewhere && section.elsewhere.length > 0 && (
          <div className="rounded-md bg-sand px-4 py-3 text-sm">
            <p className="text-xs font-medium text-muted">Edited elsewhere</p>
            <ul className="mt-1 space-y-1">
              {section.elsewhere.map((e) => (
                <li key={e.href + e.label}>
                  <Link href={e.href} className="font-medium text-ink underline-offset-4 hover:underline">
                    {e.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

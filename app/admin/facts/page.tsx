import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ContentFields } from "@/components/admin/content-fields";
import { EditorForm } from "@/components/admin/editor-form";
import { ImageField } from "@/components/admin/image-field";
import { LinkField, type LinkOption } from "@/components/admin/link-field";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, Card, Flash, PageHeader } from "@/components/admin/ui";
import { deleteFactTab, saveContent, saveFactTab } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { CONTENT_GROUPS } from "@/lib/content";
import { getDb } from "@/lib/db/client";
import { factTabs, projects, type FactTab, type Project } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";
import { FACT_LINK_PAGES, factRowsText, projectFactRows } from "@/lib/facts";
import { mediaUrl } from "@/lib/media";

export const metadata = { title: "Project facts" };

const isPublic = (p: Project) => p.published && p.status === "completed";

/** Projects that are not on the public site are marked: their tab, or a button to them, waits. */
function projectLabel(p: Project) {
  if (!p.published) return `${p.title} (draft — not shown until published)`;
  if (p.status !== "completed") return `${p.title} (not completed — not shown yet)`;
  return p.title;
}

/** The stored link as the form's choice and address. */
function linkDefaults(link: string): { choice: string; url: string } {
  if (link === "" || link === "none" || /^project:\d+$/.test(link) || FACT_LINK_PAGES.some(([href]) => href === link)) {
    return { choice: link, url: "" };
  }
  return { choice: "custom", url: link };
}

function TabFields({
  tab,
  project,
  projectList,
  mediaBase,
  uploads,
}: {
  tab?: FactTab;
  project?: Project | null;
  projectList: Project[];
  mediaBase: string;
  uploads: boolean;
}) {
  const p = tab ? `t${tab.id}-` : "new-";
  const autoRows = project ? factRowsText(projectFactRows(project)) : "";
  const name = tab?.title || project?.title || "";
  const link = linkDefaults(tab?.link ?? "");
  const linkOptions: LinkOption[] = [
    { value: "", label: "This tab's project page" },
    ...projectList.filter((o) => o.id !== project?.id).map((o) => ({ value: `project:${o.id}`, label: `Project: ${projectLabel(o)}` })),
    ...FACT_LINK_PAGES.map(([value, label]) => ({ value, label: `Page: ${label}` })),
    { value: "none", label: "No button" },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${p}projectId`} className="label">Project</label>
        <select id={`${p}projectId`} name="projectId" defaultValue={tab?.projectId ?? project?.id ?? ""} className="field">
          <option value="">No project (write everything below)</option>
          {projectList.map((o) => (
            <option key={o.id} value={o.id}>{projectLabel(o)}</option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted">
          The fields below that you leave empty show this project&apos;s own name, facts, cover photo and page, and stay up to
          date when the project changes. After choosing another project, save to see its values in grey.
        </p>
      </div>

      <div>
        <label htmlFor={`${p}title`} className="label">Tab name</label>
        <input id={`${p}title`} name="title" defaultValue={tab?.title} maxLength={120} placeholder={project?.title ?? "Required without a project"} className="field" />
      </div>
      <div className="flex items-end pb-2.5">
        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" name="visible" defaultChecked={tab?.visible ?? true} className="size-4 rounded border-line accent-brand" />
          Show this tab on the website
        </label>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${p}rows`} className="label">Facts table</label>
        <textarea
          id={`${p}rows`}
          name="rows"
          rows={Math.max(6, (tab?.rows || autoRows).split("\n").length + 1)}
          defaultValue={tab?.rows}
          maxLength={4000}
          placeholder={autoRows || "Location: New Cairo\nArea: 1,200 m²\nScope: HVAC, electrical and plumbing"}
          className="field font-normal"
        />
        <p className="mt-1.5 text-xs text-muted">
          One row per line, written as <strong>Label: value</strong>. Add, remove, reorder or rename any row. Leave it empty to
          show the project&apos;s facts (shown in grey), kept up to date.
        </p>
      </div>

      <div className="sm:col-span-2">
        <ImageField
          name="imageKey"
          label="Photo"
          path="site/pages/project-facts"
          nameFrom={["title"]}
          defaultKey={tab?.imageKey ?? null}
          fallbackKey={project?.coverKey ?? null}
          mediaBase={mediaBase}
          enabled={uploads}
          hint={project ? "Upload one, or choose any project's photo. Empty: the project's cover photo." : "Upload one, or choose any project's photo."}
        />
      </div>

      <LinkField
        id={`${p}link`}
        label="Button opens"
        choiceName="linkChoice"
        urlName="linkUrl"
        options={project || !tab ? linkOptions : linkOptions.filter((o) => o.value !== "")}
        defaultChoice={!project && tab && link.choice === "" ? "none" : link.choice}
        defaultUrl={link.url}
        hint="Another link: a page of this site (like /contact) or any website (https://…), which opens in a new tab."
      />
      <div>
        <label htmlFor={`${p}linkLabel`} className="label">Button text</label>
        <input id={`${p}linkLabel`} name="linkLabel" defaultValue={tab?.linkLabel} maxLength={80} placeholder={name ? `View ${name}` : "View project"} className="field" />
      </div>
    </div>
  );
}

export default async function FactsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [tabs, projectList, row, mediaBase, bucket] = await Promise.all([
    db.query.factTabs.findMany({ orderBy: [asc(factTabs.sortOrder), asc(factTabs.id)] }),
    db.query.projects.findMany({ orderBy: [asc(projects.title)] }),
    db.query.settings.findFirst(),
    getMediaBase(),
    getMediaBucket(),
  ]);
  const uploads = !!bucket;
  const byId = new Map(projectList.map((p) => [p.id, p]));
  const section = CONTENT_GROUPS.find((g) => g.id === "facts")!;

  return (
    <>
      <PageHeader title="Project facts" />
      <p className="-mt-3 mb-6 max-w-3xl text-sm text-muted">
        The tabbed section on the home page: each tab shows a facts table beside a photo, with a button. Add, remove, hide and
        drag tabs into order; change any tab&apos;s name, facts, photo and button. Anything left empty follows the tab&apos;s
        project, shown in grey.
      </p>
      <Flash searchParams={await searchParams} />

      <section className="mb-10 max-w-3xl">
        <h2 className="mb-3 font-semibold">Section</h2>
        <EditorForm action={saveContent}>
          <ContentFields group={section} saved={row?.content ?? {}} mediaBase={mediaBase} uploads={uploads} />
        </EditorForm>
      </section>

      <section className="max-w-3xl">
        <h2 className="mb-1 font-semibold">Tabs</h2>
        <p className="mb-3 text-sm text-muted">In the order they appear. Drag the handle to reorder; the order saves at once.</p>
        {tabs.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No tabs yet, so the section is not shown. Add the first one below.</p>
          </Card>
        ) : (
          <SortableList
            kind="factTabs"
            noun="Tab order"
            items={tabs.map((t) => {
              const project = t.projectId ? (byId.get(t.projectId) ?? null) : null;
              const name = t.title || project?.title || "Untitled tab";
              const thumb = mediaUrl((t.imageKey || project?.coverKey || null)?.replace(/\.(\w+)$/, "-thumb.$1") ?? null, mediaBase);
              const waiting = project && !isPublic(project);
              return {
                id: t.id,
                label: name,
                node: (
                  <details className="group" id={`tab-${t.id}`}>
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden bg-sand">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{name}</span>
                        <span className="block truncate text-xs text-muted">
                          {project ? `Project: ${project.title}` : "Written by hand"}
                          {t.rows ? " · own facts" : project ? " · project's facts" : ""}
                        </span>
                      </span>
                      {!t.visible && <Badge>Hidden</Badge>}
                      {t.visible && waiting && <Badge tone="amber">Waits for the project</Badge>}
                      <span className="text-sm text-muted group-open:hidden">Edit</span>
                    </summary>
                    <div className="border-t border-line px-5 py-5">
                      <form action={saveFactTab.bind(null, t.id)} className="space-y-5">
                        <TabFields tab={t} project={project} projectList={projectList} mediaBase={mediaBase} uploads={uploads} />
                        <button className="btn-primary py-2">Save</button>
                      </form>
                      <form action={deleteFactTab.bind(null, t.id)} className="mt-3">
                        <ConfirmButton message={`Delete the tab “${name}”? The project itself stays.`} className="btn px-0 py-1 text-red-700 hover:underline">
                          Delete tab
                        </ConfirmButton>
                      </form>
                    </div>
                  </details>
                ),
              };
            })}
          />
        )}

        <Card className="mt-8">
          <h2 className="mb-1 font-semibold">Add a tab</h2>
          <p className="mb-4 text-sm text-muted">Pick a project and save: its name, facts, photo and page fill in by themselves. Change anything afterwards.</p>
          <form action={saveFactTab.bind(null, null)} className="space-y-5">
            <TabFields projectList={projectList} mediaBase={mediaBase} uploads={uploads} />
            <button className="btn-primary py-2">Add tab</button>
          </form>
        </Card>
      </section>
    </>
  );
}

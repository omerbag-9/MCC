import { formatArea } from "@/components/site/project-card";
import type { FactTab, Project } from "@/lib/db/schema";
import { specRows } from "@/lib/format";

/*
 * The home page's "Project facts" tabs (Admin → Project facts). Each field a tab leaves empty
 * follows its project, so a tab with only a project picked keeps showing that project's current
 * title, facts, cover and page.
 */

export type FactRow = [label: string, value: string];

/** Pages of the site a tab's button can open, besides projects. */
export const FACT_LINK_PAGES = [
  ["/projects", "All projects"],
  ["/about", "About us"],
  ["/news", "News"],
  ["/contact", "Contact us"],
] as const;

/** A project's facts as the section shows them when the tab has no rows of its own. */
export function projectFactRows(p: Project): FactRow[] {
  return [
    ...([
      ["Category", p.category],
      ["Location", p.location],
      ["Completed", p.year?.toString() ?? ""],
      ["Area", formatArea(p.areaM2) ?? ""],
      ["Client", p.client],
    ].filter(([, v]) => v) as FactRow[]),
    ...specRows(p.specs),
  ].slice(0, 9);
}

/** The same rows as editable text, one "Label: value" per line (the admin's grey placeholder). */
export function factRowsText(rows: FactRow[]): string {
  return rows.map(([k, v]) => (k ? `${k}: ${v}` : v)).join("\n");
}

const isPublic = (p: Pick<Project, "published" | "status"> | null | undefined) => !!p && p.published && p.status === "completed";

/** Where a tab's button goes, or null for no button. */
export function factLinkHref(
  link: string,
  project: Pick<Project, "slug" | "published" | "status"> | null,
  projectsById: Map<number, Pick<Project, "slug" | "published" | "status">>,
): string | null {
  const value = link.trim();
  if (value === "none") return null;
  if (value === "") return isPublic(project) ? `/projects/${project!.slug}` : null;
  const other = /^project:(\d+)$/.exec(value);
  if (other) {
    const p = projectsById.get(Number(other[1]));
    return isPublic(p) ? `/projects/${p!.slug}` : null;
  }
  return value;
}

export type ResolvedFactTab = {
  id: number;
  title: string;
  rows: FactRow[];
  imageKey: string | null;
  href: string | null;
  linkLabel: string;
  /** Opens in a new tab (a link to another website). */
  external: boolean;
};

/**
 * What the site shows for a tab: its own values, the project's where it has none. Tabs that are
 * hidden, or whose project is not on the public site, are left out.
 */
export function resolveFactTab(
  tab: FactTab,
  project: Project | null,
  projectsById: Map<number, Pick<Project, "slug" | "published" | "status">>,
): ResolvedFactTab | null {
  if (!tab.visible) return null;
  if (tab.projectId && !isPublic(project)) return null;
  const title = tab.title.trim() || project?.title || "";
  if (!title) return null;
  const rows = tab.rows.trim() ? specRows(tab.rows) : project ? projectFactRows(project) : [];
  const href = factLinkHref(tab.link, project, projectsById);
  return {
    id: tab.id,
    title,
    rows,
    imageKey: tab.imageKey || project?.coverKey || null,
    href,
    linkLabel: tab.linkLabel.trim() || `View ${title}`,
    external: !!href && /^https?:\/\//.test(href),
  };
}

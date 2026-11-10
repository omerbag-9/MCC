import type { NewsKind, ProjectStatus } from "@/lib/db/schema";

/** How each kind of post is named on the site and in the admin. */
export const NEWS_KIND_LABEL: Record<NewsKind, string> = {
  won: "Project won",
  started: "Work started",
  progress: "Progress update",
  completed: "Project completed",
  general: "Company news",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  awarded: "Won, not started",
  in_progress: "Under construction",
  completed: "Completed",
};

/** The project status a post moves its project to (progress and general leave it alone). */
export const KIND_TO_STATUS: Partial<Record<NewsKind, ProjectStatus>> = {
  won: "awarded",
  started: "in_progress",
  completed: "completed",
};

/** Kinds that are about one project and therefore need one. */
export const PROJECT_KINDS: NewsKind[] = ["won", "started", "progress", "completed"];

/** Title suggested when the admin leaves it empty. */
export function defaultNewsTitle(kind: NewsKind, project: string): string {
  switch (kind) {
    case "won":
      return `We have been awarded ${project}`;
    case "started":
      return `Work has started on ${project}`;
    case "progress":
      return `Progress on ${project}`;
    case "completed":
      return `${project} is complete`;
    default:
      return project;
  }
}

/**
 * LinkedIn's share dialog for a page. LinkedIn reads the page's title, description and image
 * (Open Graph tags) to build the preview card; the person adds their own text and posts it.
 */
export function linkedinShareUrl(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

export function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(date);
}

/** yyyy-mm-dd for <input type="date">. */
export function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

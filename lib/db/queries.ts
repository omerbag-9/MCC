import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { isBuildPhase } from "@/lib/env";
import { resolveContent } from "@/lib/content";
import { getDb } from "./client";
import {
  clients,
  newsPosts,
  projectMedia,
  projects,
  services,
  settings,
  type Settings,
} from "./schema";

/*
 * Read queries for the public site.
 *
 * During `next build` there is no production database, so these return empty data. Those
 * build-time pages are never uploaded to the cache (scripts/deploy.mjs runs `wrangler deploy`
 * directly), so after each deploy every page renders from D1 on its first visit.
 */

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  companyName: "MCC Construction",
  tagline: "Building with integrity",
  heroTitle: "We build what lasts",
  heroSubtitle: "Residential, commercial and industrial construction delivered on time and on budget.",
  heroImageKey: null,
  heroVideoKey: null,
  aboutTitle: "About us",
  aboutBody: "",
  strengths: "",
  content: {},
  stats: [],
  phone: "",
  email: "",
  whatsappNumber: "",
  whatsappMessage: "Hello, I'd like to get in touch.",
  address: "",
  workingHours: "",
  mapEmbedUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  seoTitle: "",
  seoDescription: "",
  updatedAt: new Date(0),
};

async function safe<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (isBuildPhase()) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error("Database query failed", error);
    return fallback;
  }
}

export const getSettings = cache(() =>
  safe(DEFAULT_SETTINGS, async () => {
    const db = await getDb();
    const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
    return row ?? DEFAULT_SETTINGS;
  }),
);

/** Website text, images and section switches, with defaults for anything not edited yet. */
export const getContent = cache(async () => {
  const settings = await getSettings();
  return resolveContent(settings.content, settings.companyName);
});

export const getPublishedServices = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.services.findMany({
      where: eq(services.published, true),
      orderBy: [asc(services.sortOrder), asc(services.id)],
    });
  }),
);

export const getPublishedProjects = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.projects.findMany({
      where: and(eq(projects.published, true), eq(projects.status, "completed")),
      orderBy: [asc(projects.sortOrder), desc(projects.year), desc(projects.id)],
    });
  }),
);

export const getFeaturedProjects = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.projects.findMany({
      where: and(eq(projects.published, true), eq(projects.status, "completed"), eq(projects.featured, true)),
      orderBy: [asc(projects.sortOrder), desc(projects.id)],
      limit: 6,
    });
  }),
);

export const getPublishedProjectBySlug = cache((slug: string) =>
  safe(null, async () => {
    const db = await getDb();
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.slug, slug), eq(projects.published, true), eq(projects.status, "completed")),
    });
    if (!project) return null;
    const media = await db.query.projectMedia.findMany({
      where: eq(projectMedia.projectId, project.id),
      orderBy: [asc(projectMedia.sortOrder), asc(projectMedia.id)],
    });
    return { ...project, media };
  }),
);

export const getClients = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.clients.findMany({ orderBy: [asc(clients.sortOrder), asc(clients.id)] });
  }),
);

/* News: the portfolio only lists completed projects, so a post links to its project once it is. */

export const getPublishedNews = cache((limit?: number) =>
  safe([], async () => {
    const db = await getDb();
    return db.query.newsPosts.findMany({
      where: eq(newsPosts.published, true),
      orderBy: [desc(newsPosts.postedAt), desc(newsPosts.id)],
      with: { project: { columns: { title: true, slug: true, status: true, published: true } } },
      ...(limit && { limit }),
    });
  }),
);

/** Posts on the News page, newest first. */
export const NEWS_PER_PAGE = 9;

/** One page of published news (1-based) and the total number of published posts. */
export const getPublishedNewsPage = cache((page: number) =>
  safe({ posts: [] as Awaited<ReturnType<typeof getPublishedNews>>, total: 0 }, async () => {
    const db = await getDb();
    const [posts, [{ n }]] = await Promise.all([
      db.query.newsPosts.findMany({
        where: eq(newsPosts.published, true),
        orderBy: [desc(newsPosts.postedAt), desc(newsPosts.id)],
        with: { project: { columns: { title: true, slug: true, status: true, published: true } } },
        limit: NEWS_PER_PAGE,
        offset: (page - 1) * NEWS_PER_PAGE,
      }),
      db.select({ n: count() }).from(newsPosts).where(eq(newsPosts.published, true)),
    ]);
    return { posts, total: n };
  }),
);

export const getPublishedNewsBySlug = cache((slug: string) =>
  safe(null, async () => {
    const db = await getDb();
    const post = await db.query.newsPosts.findFirst({
      where: and(eq(newsPosts.slug, slug), eq(newsPosts.published, true)),
      with: { project: { columns: { id: true, title: true, slug: true, status: true, published: true, coverKey: true, category: true, location: true, areaM2: true, client: true } } },
    });
    if (!post) return null;
    // The project's whole story, oldest first: won, started, progress..., completed.
    const timeline = post.projectId
      ? await db.query.newsPosts.findMany({
          where: and(eq(newsPosts.projectId, post.projectId), eq(newsPosts.published, true)),
          orderBy: [asc(newsPosts.postedAt), asc(newsPosts.id)],
          columns: { id: true, slug: true, kind: true, title: true, postedAt: true },
        })
      : [];
    return { ...post, timeline };
  }),
);

/** A project's published updates, oldest first, for the timeline on its page. */
export const getProjectNews = cache((projectId: number) =>
  safe([], async () => {
    const db = await getDb();
    return db.query.newsPosts.findMany({
      where: and(eq(newsPosts.projectId, projectId), eq(newsPosts.published, true)),
      orderBy: [asc(newsPosts.postedAt), asc(newsPosts.id)],
      columns: { id: true, slug: true, kind: true, title: true, summary: true, postedAt: true },
    });
  }),
);

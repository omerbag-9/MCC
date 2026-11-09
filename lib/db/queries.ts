import "server-only";
import { cache } from "react";
import { and, asc, desc, eq } from "drizzle-orm";
import { isBuildPhase } from "@/lib/env";
import { getDb } from "./client";
import {
  clients,
  projectMedia,
  projects,
  services,
  settings,
  testimonials,
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
  aboutTitle: "About us",
  aboutBody: "",
  stats: [],
  phone: "",
  email: "",
  whatsappNumber: "",
  whatsappMessage: "Hello, I'd like to ask about a project.",
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
      where: eq(projects.published, true),
      orderBy: [asc(projects.sortOrder), desc(projects.year), desc(projects.id)],
    });
  }),
);

export const getFeaturedProjects = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.projects.findMany({
      where: and(eq(projects.published, true), eq(projects.featured, true)),
      orderBy: [asc(projects.sortOrder), desc(projects.id)],
      limit: 6,
    });
  }),
);

export const getPublishedProjectBySlug = cache((slug: string) =>
  safe(null, async () => {
    const db = await getDb();
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.slug, slug), eq(projects.published, true)),
    });
    if (!project) return null;
    const media = await db.query.projectMedia.findMany({
      where: eq(projectMedia.projectId, project.id),
      orderBy: [asc(projectMedia.sortOrder), asc(projectMedia.id)],
    });
    return { ...project, media };
  }),
);

export const getPublishedTestimonials = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.testimonials.findMany({
      where: eq(testimonials.published, true),
      orderBy: [asc(testimonials.sortOrder), asc(testimonials.id)],
    });
  }),
);

export const getClients = cache(() =>
  safe([], async () => {
    const db = await getDb();
    return db.query.clients.findMany({ orderBy: [asc(clients.sortOrder), asc(clients.id)] });
  }),
);

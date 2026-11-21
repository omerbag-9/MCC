"use server";

import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import {
  clients,
  factTabs,
  HERO_MODES,
  LEAD_STATUSES,
  leads,
  NEWS_KINDS,
  newsPosts,
  PROJECT_STATUSES,
  projectMedia,
  projects,
  services,
  settings,
} from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";
import { CONTENT_SECTIONS } from "@/lib/content";
import { slugify } from "@/lib/format";
import { mapEmbedFromInput } from "@/lib/maps";
import { MEDIA_KEY_PATTERN, mediaUrl } from "@/lib/media";
import { FACT_LINK_PAGES } from "@/lib/facts";
import { defaultNewsTitle, KIND_TO_STATUS, PROJECT_KINDS } from "@/lib/news";
import { revalidateSite } from "@/lib/revalidate";

/*
 * Every action starts with requireAdmin(): server actions are public HTTP endpoints, so they must
 * check auth themselves rather than relying on the page they are rendered on.
 */

const str = (max: number) => z.string().trim().max(max);
const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(0).max(1_000_000_000).nullable(),
);
const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());
const mediaKey = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.string().regex(MEDIA_KEY_PATTERN).nullable(),
);

function form(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Names the admin shows for fields whose form name is not a word ("mapEmbedUrl: …" reads as "Map: …"). */
const FIELD_NAMES: Record<string, string> = {
  companyName: "Company name",
  mapEmbedUrl: "Map",
  workingHours: "Working hours",
  facebookUrl: "Facebook",
  instagramUrl: "Instagram",
  linkedinUrl: "LinkedIn",
  youtubeUrl: "YouTube",
  tiktokUrl: "TikTok",
  seoTitle: "Site title",
  seoDescription: "Site description",
  heroTitle: "Title",
  heroSubtitle: "Text under the title",
  heroMode: "Behind the title",
  heroSlides: "Slideshow",
  heroSlideSeconds: "Time per photo",
  aboutTitle: "About heading",
  aboutBody: "About text",
  strengths: "Why choose us points",
};

function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Invalid input";
  const path = issue.path.join(".");
  return `${FIELD_NAMES[path] ?? (path || "form")}: ${issue.message}`;
}

/**
 * "Deletes" media by moving it to trash/<date>/<key> in the same bucket; a lifecycle rule
 * (scripts/backup.mjs) removes trash after 30 days, so an accidental delete can be undone by
 * copying the file back. trash/ is never served: the /media route only serves projects/, site/
 * and clients/ keys. The original is removed only once its copy is safe.
 */
async function deleteObjects(keys: (string | null | undefined)[]) {
  const candidates = keys.filter((k): k is string => !!k && MEDIA_KEY_PATTERN.test(k));
  if (candidates.length === 0) return;
  try {
    // One file can be used in several places (a project photo chosen for a page section, a news
    // cover, a hero...): keep any file another row still points to.
    const db = await getDb();
    const inUse = new Set<string>();
    for (const key of new Set(candidates.map((k) => k.replace("-thumb.", ".")))) {
      const found = await db.batch([
        db.select({ id: projectMedia.id }).from(projectMedia).where(eq(projectMedia.key, key)).limit(1),
        db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.coverKey, key)).limit(1),
        db
          .select({ id: projects.id })
          .from(projects)
          .where(sql`${projects.coverKey} = ${key} or ${projects.storyImageKey} = ${key} or ${projects.overviewImageKey} = ${key}`)
          .limit(1),
        db.select({ id: services.id }).from(services).where(eq(services.imageKey, key)).limit(1),
        db.select({ id: clients.id }).from(clients).where(eq(clients.logoKey, key)).limit(1),
        db.select({ id: factTabs.id }).from(factTabs).where(eq(factTabs.imageKey, key)).limit(1),
        db
          .select({ id: settings.id })
          .from(settings)
          .where(
            sql`${settings.heroImageKey} = ${key} or ${settings.heroVideoKey} = ${key} or instr(${settings.heroSlides}, ${JSON.stringify(key)}) > 0 or instr(${settings.content}, ${JSON.stringify(key)}) > 0`,
          )
          .limit(1),
      ]);
      if (found.some((rows) => rows.length > 0)) inUse.add(key);
    }
    const valid = candidates.filter((k) => !inUse.has(k.replace("-thumb.", ".")));
    if (valid.length === 0) return;
    const bucket = await getMediaBucket();
    if (!bucket) return;
    const day = new Date().toISOString().slice(0, 10);
    for (const key of valid) {
      const object = await bucket.get(key);
      if (!object) continue;
      // Stream the copy (videos can be 100 MB): R2 needs a known length, hence FixedLengthStream.
      await bucket.put(`trash/${day}/${key}`, object.body.pipeThrough(new FixedLengthStream(object.size)), {
        httpMetadata: object.httpMetadata,
      });
      await bucket.delete(key);
    }
  } catch (error) {
    console.error("Failed to move media to trash", error);
  }
}

function thumbOf(key: string | null) {
  return key ? key.replace(/\.(\w+)$/, "-thumb.$1") : null;
}

/* ----------------------------------------------------------------------------- Settings */

const HERO_SLIDES_MAX = 12;

const settingsSchema = z.object({
  companyName: str(120).min(1, "Company name is required"),
  tagline: str(200),
  heroTitle: str(200),
  heroSubtitle: str(500),
  heroImageKey: mediaKey,
  heroVideoKey: mediaKey,
  heroMode: z.enum(HERO_MODES),
  /** The slideshow's photos as a JSON array of media keys, in order. */
  heroSlides: z.preprocess(
    (v) => {
      try {
        return JSON.parse(String(v || "[]"));
      } catch {
        return null;
      }
    },
    z
      .array(z.string().regex(MEDIA_KEY_PATTERN, "invalid photo"))
      .max(HERO_SLIDES_MAX, `at most ${HERO_SLIDES_MAX} photos`)
      .transform((keys) => Array.from(new Set(keys))),
  ),
  heroSlideSeconds: z.coerce.number().int().min(3).max(20),
  aboutTitle: str(200),
  aboutBody: str(5000),
  strengths: str(2000),
  phone: str(40),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  address: str(300),
  workingHours: str(200),
  /** Google Maps' "Embed a map" code or its address (see mapEmbedFromInput). */
  mapEmbedUrl: z
    .string()
    .max(4000)
    .transform((v, ctx) => {
      const url = mapEmbedFromInput(v);
      if (url === null) {
        ctx.addIssue({
          code: "custom",
          message: "paste the map from Google Maps → Share → Embed a map → Copy HTML (a share link like maps.app.goo.gl can't be shown inside the page)",
        });
        return z.NEVER;
      }
      return url;
    }),
  facebookUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  instagramUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  linkedinUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  youtubeUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  tiktokUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  seoTitle: str(120),
  seoDescription: str(300),
});

/** Saves Admin → Site settings. Only the fields on the form change (see saveSiteFields). */
export async function saveSettings(formData: FormData): Promise<ActionResult> {
  return saveSiteFields(formData);
}

/** Saves Admin → Website content and the section fields of Admin → Project facts. */
export async function saveContent(formData: FormData): Promise<ActionResult> {
  return saveSiteFields(formData);
}

/**
 * Saves whatever site-wide fields a form holds, and nothing else, so each admin page can edit its
 * part without touching the rest:
 * - Site settings columns (company, contact, the home page's hero, about text, points…), by name
 * - the figures under the hero, when their stat_value_<n> inputs are on the form
 * - lib/content.ts fields of the sections named by the form's hidden c__groups inputs
 */
async function saveSiteFields(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const raw = form(formData);

  const present = Object.fromEntries(Object.keys(settingsSchema.shape).filter((k) => k in raw).map((k) => [k, raw[k]]));
  const parsed = settingsSchema.partial().safeParse(present);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const columns: Partial<typeof settings.$inferInsert> = { ...parsed.data };
  if ("stat_value_0" in raw) {
    const stats: { value: string; label: string }[] = [];
    for (let i = 0; i < 3; i++) {
      const value = String(raw[`stat_value_${i}`] ?? "").trim().slice(0, 20);
      const label = String(raw[`stat_label_${i}`] ?? "").trim().slice(0, 60);
      if (value && label) stats.push({ value, label });
    }
    columns.stats = stats;
  }

  const db = await getDb();
  const previous = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  const onForm = new Set(formData.getAll("c__groups").map(String));
  const fields = CONTENT_SECTIONS.filter((g) => onForm.has(g.id)).flatMap((g) => g.fields);
  if (fields.length > 0) {
    const content: Record<string, string> = { ...(previous?.content ?? {}) };
    for (const f of fields) {
      const value = String(formData.get(`c_${f.key}`) ?? "").trim();
      if (f.required && f.kind !== "toggle" && f.kind !== "image" && !value) return { ok: false, error: `${f.label}: write it, the website needs it` };
      if (f.kind === "toggle") content[f.key] = formData.get(`c_${f.key}`) === "on" ? "1" : "0";
      else if (f.kind === "image") {
        if (value && !MEDIA_KEY_PATTERN.test(value)) return { ok: false, error: `${f.label}: invalid image` };
        content[f.key] = value;
      } else content[f.key] = value.slice(0, f.kind === "textarea" ? 5000 : 300);
    }
    columns.content = content;
  }
  if (Object.keys(columns).length === 0) return { ok: false, error: "Nothing to save" };

  await db
    .insert(settings)
    .values({ id: 1, ...columns })
    .onConflictDoUpdate({ target: settings.id, set: { ...columns, updatedAt: new Date() } });

  // Photos and videos that were replaced or removed go to the bucket's trash.
  const replaced = [
    "heroImageKey" in columns && previous?.heroImageKey !== columns.heroImageKey ? previous?.heroImageKey : null,
    "heroVideoKey" in columns && previous?.heroVideoKey !== columns.heroVideoKey ? previous?.heroVideoKey : null,
    ...("heroSlides" in columns ? (previous?.heroSlides ?? []).filter((k) => !columns.heroSlides?.includes(k)) : []),
    ...fields
      .filter((f) => f.kind === "image")
      .map((f) => previous?.content?.[f.key])
      .filter((k) => !!k && !Object.values(columns.content ?? {}).includes(k as string)),
  ].filter((k): k is string => !!k);
  if (replaced.length) await deleteObjects(replaced.flatMap((k) => [k, thumbOf(k)]));
  revalidateSite();
  return { ok: true };
}

/* ----------------------------------------------------------------------------- Projects */

const projectSchema = z.object({
  title: str(200).min(1, "Title is required"),
  slug: str(80),
  summary: str(400),
  body: str(20000),
  category: str(60),
  location: str(120),
  client: str(120),
  year: optionalInt,
  areaM2: optionalInt,
  specs: str(4000),
  highlights: str(4000),
  status: z.enum(PROJECT_STATUSES),
  featured: checkbox,
  published: checkbox,
  seoTitle: str(120),
  seoDescription: str(300),
});

type Db = Awaited<ReturnType<typeof getDb>>;

async function uniqueSlug(db: Db, wanted: string, excludeId?: number, table: typeof projects | typeof newsPosts = projects) {
  const base = slugify(wanted) || (table === projects ? "project" : "news");
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const [clash] = await db
      .select({ id: table.id })
      .from(table)
      .where(excludeId ? and(eq(table.slug, slug), ne(table.id, excludeId)) : eq(table.slug, slug))
      .limit(1);
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const parsed = projectSchema.safeParse(form(formData));
  if (!parsed.success) fail("/admin/projects/new", firstError(parsed.error));
  const db = await getDb();
  const slug = await uniqueSlug(db, parsed.data.slug || parsed.data.title);
  const [row] = await db
    .insert(projects)
    .values({ ...parsed.data, slug })
    .returning({ id: projects.id });
  revalidateSite();
  redirect(`/admin/projects/${row.id}?saved=1`);
}

export async function updateProject(id: number, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(form(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const db = await getDb();
  const slug = await uniqueSlug(db, parsed.data.slug || parsed.data.title, id);
  await db
    .update(projects)
    .set({ ...parsed.data, slug, updatedAt: new Date() })
    .where(eq(projects.id, id));
  revalidateSite();
  return { ok: true };
}

export async function deleteProject(id: number) {
  await requireAdmin();
  const db = await getDb();
  const media = await db.query.projectMedia.findMany({ where: eq(projectMedia.projectId, id) });
  await db.delete(projectMedia).where(eq(projectMedia.projectId, id));
  // Its news posts stay, as company news.
  await db.update(newsPosts).set({ projectId: null }).where(eq(newsPosts.projectId, id));
  // Its client keeps its logo, which links to the client's website again.
  await db.update(clients).set({ projectId: null }).where(eq(clients.projectId, id));
  // Its Project facts tabs go; a tab whose button opened it goes back to its own project's page.
  const tabs = await db.query.factTabs.findMany({ where: eq(factTabs.projectId, id), columns: { imageKey: true } });
  await db.delete(factTabs).where(eq(factTabs.projectId, id));
  await db.update(factTabs).set({ link: "" }).where(eq(factTabs.link, `project:${id}`));
  await db.delete(projects).where(eq(projects.id, id));
  await deleteObjects([...media.flatMap((m) => [m.key, m.thumbKey]), ...tabs.flatMap((t) => [t.imageKey, thumbOf(t.imageKey)])]);
  revalidateSite();
  redirect("/admin/projects?deleted=1");
}

const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  key: z.string().regex(MEDIA_KEY_PATTERN),
  thumbKey: z.string().regex(MEDIA_KEY_PATTERN).nullable(),
  width: z.number().int().positive().max(20000).nullable(),
  height: z.number().int().positive().max(20000).nullable(),
});

/** Called by the media uploader after files have been uploaded to R2. */
export async function addProjectMedia(projectId: number, items: unknown) {
  await requireAdmin();
  const parsed = z.array(mediaItemSchema).max(50).safeParse(items);
  if (!parsed.success) return { ok: false as const, error: "Invalid media" };
  if (parsed.data.length === 0) return { ok: true as const };

  const db = await getDb();
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project) return { ok: false as const, error: "Project not found" };

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${projectMedia.sortOrder}), 0)` })
    .from(projectMedia)
    .where(eq(projectMedia.projectId, projectId));

  await db.insert(projectMedia).values(
    parsed.data.map((m, i) => ({ ...m, projectId, sortOrder: max + i + 1 })),
  );

  // First image becomes the cover if the project has none yet.
  const firstImage = parsed.data.find((m) => m.type === "image");
  if (!project.coverKey && firstImage) {
    await db.update(projects).set({ coverKey: firstImage.key, updatedAt: new Date() }).where(eq(projects.id, projectId));
  }
  revalidateSite();
  return { ok: true as const };
}

export async function updateMediaAlt(mediaId: number, projectId: number, alt: string): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  await db
    .update(projectMedia)
    .set({ alt: String(alt ?? "").trim().slice(0, 300) })
    .where(and(eq(projectMedia.id, mediaId), eq(projectMedia.projectId, projectId)));
  revalidateSite();
  return { ok: true };
}

export async function setCover(mediaId: number, projectId: number): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  const media = await db.query.projectMedia.findFirst({
    where: and(eq(projectMedia.id, mediaId), eq(projectMedia.projectId, projectId)),
  });
  if (media?.type !== "image") return { ok: false, error: "Only a photo can be the cover" };
  await db.update(projects).set({ coverKey: media.key, updatedAt: new Date() }).where(eq(projects.id, projectId));
  revalidateSite();
  return { ok: true };
}

export type ProjectPhotos = {
  id: number;
  title: string;
  photos: { key: string; thumb: string; alt: string; n: number }[];
};

/** Every project's photos, for "Choose from projects" beside a photo field in the admin. */
export async function listProjectPhotos(): Promise<ProjectPhotos[]> {
  await requireAdmin();
  const db = await getDb();
  const [rows, media, mediaBase] = await Promise.all([
    db.query.projects.findMany({
      columns: { id: true, title: true },
      orderBy: (p, { asc, desc }) => [asc(p.sortOrder), desc(p.id)],
    }),
    db.query.projectMedia.findMany({
      columns: { projectId: true, key: true, thumbKey: true, alt: true },
      where: eq(projectMedia.type, "image"),
      orderBy: (m, { asc }) => [asc(m.sortOrder), asc(m.id)],
    }),
    getMediaBase(),
  ]);
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    photos: media
      .filter((m) => m.projectId === p.id)
      .map((m, i) => ({ key: m.key, thumb: mediaUrl(m.thumbKey ?? m.key, mediaBase)!, alt: m.alt, n: i + 1 })),
  }));
}

/** Sections of a project page whose photo can be chosen; the top banner is the cover (setCover). */
export type PhotoSection = "story" | "overview";
const SECTION_COLUMN = { story: "storyImageKey", overview: "overviewImageKey" } as const;

/** Shows one of the project's photos in a section of its page, or (mediaId null) goes back to automatic. */
export async function setSectionPhoto(section: PhotoSection, mediaId: number | null, projectId: number): Promise<ActionResult> {
  await requireAdmin();
  const column = SECTION_COLUMN[section];
  if (!column) return { ok: false, error: "Unknown section" };
  const db = await getDb();
  let key: string | null = null;
  if (mediaId !== null) {
    const media = await db.query.projectMedia.findFirst({
      where: and(eq(projectMedia.id, mediaId), eq(projectMedia.projectId, projectId)),
    });
    if (media?.type !== "image") return { ok: false, error: "Only a photo can be used here" };
    key = media.key;
  }
  await db.update(projects).set({ [column]: key, updatedAt: new Date() }).where(eq(projects.id, projectId));
  revalidateSite();
  return { ok: true };
}

export async function deleteMedia(mediaId: number, projectId: number): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  const media = await db.query.projectMedia.findFirst({
    where: and(eq(projectMedia.id, mediaId), eq(projectMedia.projectId, projectId)),
  });
  if (!media) return { ok: true };
  await db.delete(projectMedia).where(eq(projectMedia.id, mediaId));
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (project?.coverKey === media.key) {
    const next = await db.query.projectMedia.findFirst({
      where: and(eq(projectMedia.projectId, projectId), eq(projectMedia.type, "image")),
      orderBy: (m, { asc }) => [asc(m.sortOrder)],
    });
    await db.update(projects).set({ coverKey: next?.key ?? null, updatedAt: new Date() }).where(eq(projects.id, projectId));
  }
  // A section that showed this photo goes back to automatic.
  if (project?.storyImageKey === media.key) await db.update(projects).set({ storyImageKey: null }).where(eq(projects.id, projectId));
  if (project?.overviewImageKey === media.key) await db.update(projects).set({ overviewImageKey: null }).where(eq(projects.id, projectId));
  await deleteObjects([media.key, media.thumbKey]);
  revalidateSite();
  return { ok: true };
}

/* ----------------------------------------------------------------------------- Ordering */

const REORDERABLE = { projects, services, clients, factTabs } as const;
export type Reorderable = keyof typeof REORDERABLE;

/** Saves a drag-and-drop order: each id gets its position as sort order. */
export async function reorder(kind: Reorderable, ids: number[]): Promise<ActionResult> {
  await requireAdmin();
  const table = REORDERABLE[kind];
  const parsed = z.array(z.number().int().positive()).max(500).safeParse(ids);
  if (!table || !parsed.success || parsed.data.length === 0) return { ok: false, error: "Invalid order" };
  const db = await getDb();
  const [first, ...rest] = parsed.data.map((id, i) => db.update(table).set({ sortOrder: i + 1 }).where(eq(table.id, id)));
  await db.batch([first, ...rest]);
  revalidateSite();
  return { ok: true };
}

/** Saves the order of a project's photos and videos. */
export async function reorderMedia(projectId: number, ids: number[]): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.array(z.number().int().positive()).max(500).safeParse(ids);
  if (!parsed.success || parsed.data.length === 0) return { ok: false, error: "Invalid order" };
  const db = await getDb();
  const [first, ...rest] = parsed.data.map((id, i) =>
    db.update(projectMedia).set({ sortOrder: i + 1 }).where(and(eq(projectMedia.id, id), eq(projectMedia.projectId, projectId))),
  );
  await db.batch([first, ...rest]);
  revalidateSite();
  return { ok: true };
}

/* ----------------------------------------------------------------------------- News */

const optionalId = z.preprocess(
  (v) => (v === "" || v == null || v === "0" ? null : Number(v)),
  z.number().int().positive().nullable(),
);
const day = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "pick a date").nullable(),
);

const newsSchema = z.object({
  kind: z.enum(NEWS_KINDS),
  title: str(200),
  slug: str(80),
  summary: str(400),
  body: str(20000),
  coverKey: mediaKey,
  projectId: optionalId,
  /** Name of a project that is not in the list yet (an announced win): it is created as a draft. */
  // Only on the new-post form, so missing when an existing post is saved.
  newProject: z.preprocess((v) => v ?? "", str(200)),
  postedAt: day,
  published: checkbox,
  // Only on the edit form (a post is shared after it is published).
  linkedinPostUrl: z.preprocess((v) => v ?? "", z.union([z.literal(""), z.string().trim().url().max(500)])),
});

type NewsInput = z.infer<typeof newsSchema>;

/**
 * Resolves (or creates) the project a post is about, and moves it to the stage the post
 * announces. A completed project is published to the portfolio, and the post's photo becomes its
 * first photo if it has none.
 */
async function applyNewsToProject(db: Db, data: NewsInput): Promise<{ projectId: number | null; projectTitle: string } | { error: string }> {
  const needsProject = PROJECT_KINDS.includes(data.kind);
  let projectId = data.projectId;

  if (!projectId && data.newProject) {
    // Starts at the first stage; the step below moves it to the post's stage, the same way as an
    // existing project (so "completed" also publishes it, and a draft post leaves it alone).
    const slug = await uniqueSlug(db, data.newProject);
    const [row] = await db
      .insert(projects)
      .values({ title: data.newProject, slug, summary: data.summary, status: "awarded", published: false })
      .returning({ id: projects.id });
    projectId = row.id;
  }
  if (!projectId) return needsProject ? { error: "Project: choose the project, or type the name of a new one" } : { projectId: null, projectTitle: "" };

  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project) return { error: "Project not found" };

  // Stages only move forward, so re-saving an old "won" post never reopens a finished project.
  // (A mistake is corrected with the project's own Stage field.)
  const status = KIND_TO_STATUS[data.kind];
  if (status && data.published && PROJECT_STATUSES.indexOf(status) > PROJECT_STATUSES.indexOf(project.status)) {
    const completed = status === "completed";
    const postedYear = data.postedAt ? Number(data.postedAt.slice(0, 4)) : new Date().getUTCFullYear();
    await db
      .update(projects)
      .set({
        status,
        ...(completed && { published: true, year: project.year ?? postedYear }),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  }

  if (data.coverKey && !project.coverKey) {
    const existing = await db.query.projectMedia.findFirst({
      where: and(eq(projectMedia.projectId, projectId), eq(projectMedia.key, data.coverKey)),
      columns: { id: true },
    });
    if (!existing) {
      await db.insert(projectMedia).values({ projectId, type: "image", key: data.coverKey, thumbKey: thumbOf(data.coverKey), alt: project.title, sortOrder: 0 });
    }
    await db.update(projects).set({ coverKey: data.coverKey, updatedAt: new Date() }).where(eq(projects.id, projectId));
  }
  return { projectId, projectTitle: project.title };
}

function newsValues(data: NewsInput, projectTitle: string) {
  return {
    kind: data.kind,
    title: data.title || defaultNewsTitle(data.kind, projectTitle || "Company news"),
    summary: data.summary,
    body: data.body,
    coverKey: data.coverKey,
    published: data.published,
    linkedinPostUrl: data.linkedinPostUrl,
    ...(data.postedAt && { postedAt: new Date(`${data.postedAt}T12:00:00Z`) }),
  };
}

export async function createNews(formData: FormData) {
  await requireAdmin();
  const parsed = newsSchema.safeParse(form(formData));
  const back = `/admin/news/new?kind=${encodeURIComponent(String(formData.get("kind") ?? ""))}`;
  if (!parsed.success) fail(back, firstError(parsed.error));
  const db = await getDb();
  const linked = await applyNewsToProject(db, parsed.data);
  if ("error" in linked) fail(back, linked.error);
  const values = newsValues(parsed.data, linked.projectTitle);
  const slug = await uniqueSlug(db, parsed.data.slug || values.title, undefined, newsPosts);
  const [row] = await db
    .insert(newsPosts)
    .values({ ...values, slug, projectId: linked.projectId })
    .returning({ id: newsPosts.id });
  revalidateSite();
  redirect(`/admin/news/${row.id}?saved=1${parsed.data.published ? "&share=1" : ""}`);
}

export async function updateNews(id: number, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newsSchema.safeParse(form(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const db = await getDb();
  const previous = await db.query.newsPosts.findFirst({ where: eq(newsPosts.id, id) });
  if (!previous) return { ok: false, error: "Post not found" };
  const linked = await applyNewsToProject(db, parsed.data);
  if ("error" in linked) return { ok: false, error: linked.error };
  const values = newsValues(parsed.data, linked.projectTitle);
  const slug = await uniqueSlug(db, parsed.data.slug || values.title, id, newsPosts);
  await db
    .update(newsPosts)
    .set({ ...values, slug, projectId: linked.projectId, updatedAt: new Date() })
    .where(eq(newsPosts.id, id));
  if (previous.coverKey && previous.coverKey !== parsed.data.coverKey) {
    await deleteObjects([previous.coverKey, thumbOf(previous.coverKey)]);
  }
  revalidateSite();
  return { ok: true };
}

export async function deleteNews(id: number) {
  await requireAdmin();
  const db = await getDb();
  const previous = await db.query.newsPosts.findFirst({ where: eq(newsPosts.id, id) });
  await db.delete(newsPosts).where(eq(newsPosts.id, id));
  await deleteObjects([previous?.coverKey, thumbOf(previous?.coverKey ?? null)]);
  revalidateSite();
  redirect("/admin/news?deleted=1");
}

/* ----------------------------------------------------------------------------- Services */

const serviceSchema = z.object({
  title: str(120).min(1, "Title is required"),
  description: str(1000),
  icon: str(30),
  imageKey: mediaKey,
  published: checkbox,
});

export async function saveService(id: number | null, formData: FormData) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(form(formData));
  if (!parsed.success) fail("/admin/services", firstError(parsed.error));
  const db = await getDb();
  if (id) {
    const previous = await db.query.services.findFirst({ where: eq(services.id, id) });
    await db.update(services).set({ ...parsed.data, updatedAt: new Date() }).where(eq(services.id, id));
    if (previous?.imageKey && previous.imageKey !== parsed.data.imageKey) {
      await deleteObjects([previous.imageKey, thumbOf(previous.imageKey)]);
    }
  } else {
    await db.insert(services).values(parsed.data);
  }
  revalidateSite();
  redirect("/admin/services?saved=1");
}

export async function deleteService(id: number) {
  await requireAdmin();
  const db = await getDb();
  const previous = await db.query.services.findFirst({ where: eq(services.id, id) });
  await db.delete(services).where(eq(services.id, id));
  await deleteObjects([previous?.imageKey, thumbOf(previous?.imageKey ?? null)]);
  revalidateSite();
  redirect("/admin/services?deleted=1");
}

/* ----------------------------------------------------------------------------- Clients */

const clientSchema = z.object({
  name: str(120).min(1, "Name is required"),
  url: z.union([z.literal(""), z.string().trim().url().max(300)]),
  logoKey: mediaKey,
  projectId: optionalId,
});

export async function saveClient(id: number | null, formData: FormData) {
  await requireAdmin();
  const parsed = clientSchema.safeParse(form(formData));
  if (!parsed.success) fail("/admin/clients", firstError(parsed.error));
  const db = await getDb();
  if (id) {
    const previous = await db.query.clients.findFirst({ where: eq(clients.id, id) });
    await db.update(clients).set(parsed.data).where(eq(clients.id, id));
    if (previous?.logoKey && previous.logoKey !== parsed.data.logoKey) {
      await deleteObjects([previous.logoKey, thumbOf(previous.logoKey)]);
    }
  } else {
    await db.insert(clients).values(parsed.data);
  }
  revalidateSite();
  redirect("/admin/clients?saved=1");
}

export async function deleteClient(id: number) {
  await requireAdmin();
  const db = await getDb();
  const previous = await db.query.clients.findFirst({ where: eq(clients.id, id) });
  await db.delete(clients).where(eq(clients.id, id));
  await deleteObjects([previous?.logoKey, thumbOf(previous?.logoKey ?? null)]);
  revalidateSite();
  redirect("/admin/clients?deleted=1");
}

/* ----------------------------------------------------------------------------- Project facts */

const factTabSchema = z
  .object({
    projectId: optionalId,
    title: str(120),
    rows: str(4000),
    imageKey: mediaKey,
    /** "" the tab's project page, "none", "project:<id>", one of FACT_LINK_PAGES, or "custom". */
    linkChoice: z.string().trim().max(40),
    /** The address typed when linkChoice is "custom": a site path or a full https link. */
    linkUrl: str(500),
    linkLabel: str(80),
    visible: checkbox,
  })
  .superRefine((v, ctx) => {
    if (!v.projectId && !v.title) ctx.addIssue({ code: "custom", path: ["title"], message: "pick a project or write a tab name" });
    const known = v.linkChoice === "" || v.linkChoice === "none" || /^project:\d+$/.test(v.linkChoice) || FACT_LINK_PAGES.some(([href]) => href === v.linkChoice);
    if (v.linkChoice === "custom") {
      const ok = /^\/[^\s]*$/.test(v.linkUrl) || /^https?:\/\/[^\s]+\.[^\s]+$/.test(v.linkUrl);
      if (!ok) ctx.addIssue({ code: "custom", path: ["linkUrl"], message: "write a page of this site (like /contact) or a full link starting with https://" });
    } else if (!known) ctx.addIssue({ code: "custom", path: ["linkChoice"], message: "choose where the button goes" });
    if (!v.projectId && v.linkChoice === "") ctx.addIssue({ code: "custom", path: ["linkChoice"], message: "a tab without a project needs another destination for its button, or no button" });
  });

export async function saveFactTab(id: number | null, formData: FormData) {
  await requireAdmin();
  const parsed = factTabSchema.safeParse(form(formData));
  if (!parsed.success) fail("/admin/facts", firstError(parsed.error));
  const { linkChoice, linkUrl, ...rest } = parsed.data;
  const values = { ...rest, link: linkChoice === "custom" ? linkUrl : linkChoice };
  const db = await getDb();
  if (id) {
    const previous = await db.query.factTabs.findFirst({ where: eq(factTabs.id, id) });
    await db.update(factTabs).set(values).where(eq(factTabs.id, id));
    if (previous?.imageKey && previous.imageKey !== values.imageKey) await deleteObjects([previous.imageKey, thumbOf(previous.imageKey)]);
  } else {
    const [last] = await db.select({ n: sql<number>`coalesce(max(${factTabs.sortOrder}), 0)` }).from(factTabs);
    await db.insert(factTabs).values({ ...values, sortOrder: (last?.n ?? 0) + 1 });
  }
  revalidateSite();
  redirect(`/admin/facts?saved=1${id ? `#tab-${id}` : ""}`);
}

export async function deleteFactTab(id: number) {
  await requireAdmin();
  const db = await getDb();
  const previous = await db.query.factTabs.findFirst({ where: eq(factTabs.id, id) });
  await db.delete(factTabs).where(eq(factTabs.id, id));
  await deleteObjects([previous?.imageKey, thumbOf(previous?.imageKey ?? null)]);
  revalidateSite();
  redirect("/admin/facts?deleted=1");
}

/* ----------------------------------------------------------------------------- Leads */

const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  notes: str(5000),
});

export async function updateLead(id: number, formData: FormData) {
  await requireAdmin();
  const parsed = leadUpdateSchema.safeParse(form(formData));
  if (!parsed.success) fail(`/admin/leads/${id}`, firstError(parsed.error));
  const db = await getDb();
  await db.update(leads).set(parsed.data).where(eq(leads.id, id));
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function deleteLead(id: number) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(leads).where(eq(leads.id, id));
  redirect("/admin/leads?deleted=1");
}

/* ----------------------------------------------------------------------------- Site cache */

export async function refreshSite() {
  await requireAdmin();
  revalidateSite();
  redirect("/admin?refreshed=1");
}

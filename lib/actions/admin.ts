"use server";

import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import {
  clients,
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
import { getMediaBucket } from "@/lib/env";
import { CONTENT_FIELDS } from "@/lib/content";
import { slugify } from "@/lib/format";
import { MEDIA_KEY_PATTERN } from "@/lib/media";
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

function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  return issue ? `${issue.path.join(".") || "form"}: ${issue.message}` : "Invalid input";
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
    // A news cover can also be a project photo: keep any file another row still points to.
    const db = await getDb();
    const inUse = new Set<string>();
    for (const key of new Set(candidates.map((k) => k.replace("-thumb.", ".")))) {
      const found = await db.batch([
        db.select({ id: projectMedia.id }).from(projectMedia).where(eq(projectMedia.key, key)).limit(1),
        db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.coverKey, key)).limit(1),
        db.select({ id: projects.id }).from(projects).where(eq(projects.coverKey, key)).limit(1),
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

const settingsSchema = z.object({
  companyName: str(120).min(1, "Company name is required"),
  tagline: str(200),
  heroTitle: str(200),
  heroSubtitle: str(500),
  heroImageKey: mediaKey,
  heroVideoKey: mediaKey,
  aboutTitle: str(200),
  aboutBody: str(5000),
  strengths: str(2000),
  phone: str(40),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  address: str(300),
  workingHours: str(200),
  mapEmbedUrl: z.union([z.literal(""), z.string().trim().url().max(2000)]),
  facebookUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  instagramUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  linkedinUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  youtubeUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  tiktokUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),
  seoTitle: str(120),
  seoDescription: str(300),
});

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const raw = form(formData);
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const stats: { value: string; label: string }[] = [];
  for (let i = 0; i < 3; i++) {
    const value = String(raw[`stat_value_${i}`] ?? "").trim().slice(0, 20);
    const label = String(raw[`stat_label_${i}`] ?? "").trim().slice(0, 60);
    if (value && label) stats.push({ value, label });
  }

  const data = { ...parsed.data, stats };
  const db = await getDb();
  const previous = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  await db
    .insert(settings)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: settings.id, set: { ...data, updatedAt: new Date() } });

  if (previous?.heroImageKey && previous.heroImageKey !== data.heroImageKey) {
    await deleteObjects([previous.heroImageKey, thumbOf(previous.heroImageKey)]);
  }
  if (previous?.heroVideoKey && previous.heroVideoKey !== data.heroVideoKey) {
    await deleteObjects([previous.heroVideoKey]);
  }
  revalidateSite();
  return { ok: true };
}

/** Saves Admin → Website content: every field of lib/content.ts, as one JSON object. */
export async function saveContent(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const content: Record<string, string> = {};
  for (const f of CONTENT_FIELDS) {
    const raw = String(formData.get(`c_${f.key}`) ?? "").trim();
    if (f.kind === "toggle") content[f.key] = formData.get(`c_${f.key}`) === "on" ? "1" : "0";
    else if (f.kind === "image") {
      if (raw && !MEDIA_KEY_PATTERN.test(raw)) return { ok: false, error: `${f.label}: invalid image` };
      content[f.key] = raw;
    } else content[f.key] = raw.slice(0, f.kind === "textarea" ? 600 : 160);
  }

  const db = await getDb();
  const previous = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  await db
    .insert(settings)
    .values({ id: 1, content })
    .onConflictDoUpdate({ target: settings.id, set: { content, updatedAt: new Date() } });

  // Photos that were replaced or removed go to the bucket's trash.
  const replaced = CONTENT_FIELDS.filter((f) => f.kind === "image")
    .map((f) => previous?.content?.[f.key])
    .filter((k): k is string => !!k && !Object.values(content).includes(k));
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
  await db.delete(projects).where(eq(projects.id, id));
  await deleteObjects(media.flatMap((m) => [m.key, m.thumbKey]));
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

const REORDERABLE = { projects, services, clients } as const;
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

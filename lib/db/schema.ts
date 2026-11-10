import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date());

/** Single-row table (id = 1) with company-wide content and contact details. */
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  companyName: text("company_name").notNull().default("Your Construction Co."),
  tagline: text("tagline").notNull().default(""),
  heroTitle: text("hero_title").notNull().default(""),
  heroSubtitle: text("hero_subtitle").notNull().default(""),
  heroImageKey: text("hero_image_key"),
  /** Muted looping video behind the hero (mp4/webm); the hero image is its poster. */
  heroVideoKey: text("hero_video_key"),
  aboutTitle: text("about_title").notNull().default(""),
  aboutBody: text("about_body").notNull().default(""),
  /** "Why choose us" points on the home page, one per line. */
  strengths: text("strengths").notNull().default(""),
  /** Editable page text, images and section switches (lib/content.ts), as { key: value }. */
  content: text("content", { mode: "json" }).$type<Record<string, string>>().notNull().default(sql`'{}'`),
  /** JSON array of { value: string, label: string } */
  stats: text("stats", { mode: "json" }).$type<Stat[]>().notNull().default(sql`'[]'`),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  /** International format, digits only, e.g. 201001234567 */
  // WhatsApp was removed from the site; these two columns stay so older deploys can roll back.
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  whatsappMessage: text("whatsapp_message").notNull().default("Hello, I'd like to ask about a project."),
  address: text("address").notNull().default(""),
  workingHours: text("working_hours").notNull().default(""),
  mapEmbedUrl: text("map_embed_url").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  tiktokUrl: text("tiktok_url").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  updatedAt: updatedAt(),
});

export type Stat = { value: string; label: string };

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  /** Key of an icon in components/site/icons.tsx */
  icon: text("icon").notNull().default("building"),
  /** Photograph shown beside the service on the home page */
  imageKey: text("image_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Where a project stands: won (not started), under construction, or handed over. */
export const PROJECT_STATUSES = ["awarded", "in_progress", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    /** Plain text; blank lines separate paragraphs. */
    body: text("body").notNull().default(""),
    category: text("category").notNull().default(""),
    location: text("location").notNull().default(""),
    year: integer("year"),
    areaM2: integer("area_m2"),
    client: text("client").notNull().default(""),
    /** Overview table rows, one per line as "Label: value". */
    specs: text("specs").notNull().default(""),
    /** Features or amenities delivered, one per line. */
    highlights: text("highlights").notNull().default(""),
    coverKey: text("cover_key"),
    /** Only completed projects appear in the public portfolio; the others show in News. */
    status: text("status", { enum: PROJECT_STATUSES }).notNull().default("completed"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("projects_published_idx").on(t.published, t.sortOrder)],
);

export const projectMedia = sqliteTable(
  "project_media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["image", "video"] }).notNull(),
    /** Full-size object key in the MEDIA bucket */
    key: text("key").notNull(),
    /** Smaller variant for grids (images only) */
    thumbKey: text("thumb_key"),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("project_media_project_idx").on(t.projectId, t.sortOrder)],
);

/**
 * What a news post announces. won / started / completed move the linked project to the matching
 * status; progress and general leave it as it is.
 */
export const NEWS_KINDS = ["won", "started", "progress", "completed", "general"] as const;
export type NewsKind = (typeof NEWS_KINDS)[number];

export const newsPosts = sqliteTable(
  "news_posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    kind: text("kind", { enum: NEWS_KINDS }).notNull().default("general"),
    title: text("title").notNull(),
    /** One or two sentences for cards, Google and the LinkedIn preview. */
    summary: text("summary").notNull().default(""),
    /** Plain text; blank lines separate paragraphs. */
    body: text("body").notNull().default(""),
    coverKey: text("cover_key"),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    /** The date shown on the post (the day of the win, the start, the handover...). */
    postedAt: integer("posted_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    /** Address of the same news on LinkedIn, once shared; shown as "Also on LinkedIn". */
    linkedinPostUrl: text("linkedin_post_url").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("news_posts_published_idx").on(t.published, t.postedAt),
    index("news_posts_project_idx").on(t.projectId),
  ],
);

export const newsPostsRelations = relations(newsPosts, ({ one }) => ({
  project: one(projects, { fields: [newsPosts.projectId], references: [projects.id] }),
}));

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  logoKey: text("logo_key"),
  url: text("url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const LEAD_STATUSES = ["new", "contacted", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const leads = sqliteTable(
  "leads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull().default(""),
    email: text("email").notNull().default(""),
    serviceInterest: text("service_interest").notNull().default(""),
    message: text("message").notNull().default(""),
    /** Page the form was submitted from, e.g. "/" or "/contact" */
    pageSource: text("page_source").notNull().default(""),
    status: text("status", { enum: LEAD_STATUSES }).notNull().default("new"),
    notes: text("notes").notNull().default(""),
    emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("leads_status_idx").on(t.status, t.createdAt)],
);

// No longer written or read (WhatsApp was removed); the table stays so older deploys can roll back.
export const whatsappClicks = sqliteTable(
  "whatsapp_clicks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageSource: text("page_source").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("whatsapp_clicks_created_idx").on(t.createdAt)],
);

export type Settings = typeof settings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectMedia = typeof projectMedia.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type NewsPost = typeof newsPosts.$inferSelect;
export type Lead = typeof leads.$inferSelect;

import { sql } from "drizzle-orm";
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
  /** JSON array of { value: string, label: string } */
  stats: text("stats", { mode: "json" }).$type<Stat[]>().notNull().default(sql`'[]'`),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  /** International format, digits only, e.g. 201001234567 */
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
export type Lead = typeof leads.$inferSelect;

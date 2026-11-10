/**
 * Editable website text, images and section switches (Admin → Website content).
 *
 * Stored as one JSON object in settings.content. Anything not saved yet falls back to the default
 * below, so a new field shows sensible text until someone edits it. In texts, {company} is replaced
 * by the company name.
 */

export type ContentKind = "text" | "textarea" | "image" | "toggle";

export type ContentField = {
  key: string;
  label: string;
  kind: ContentKind;
  default: string;
  hint?: string;
};

export type ContentGroup = { id: string; title: string; description?: string; fields: ContentField[] };

const text = (key: string, label: string, value: string, hint?: string): ContentField => ({ key, label, kind: "text", default: value, hint });
const area = (key: string, label: string, value: string, hint?: string): ContentField => ({ key, label, kind: "textarea", default: value, hint });
const image = (key: string, label: string, hint?: string): ContentField => ({ key, label, kind: "image", default: "", hint });
const toggle = (key: string, label: string, on = true): ContentField => ({ key, label, kind: "toggle", default: on ? "1" : "0" });

const REPLY = "Send us a message and we will get back to you within one business day.";

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "buttons",
    title: "Buttons",
    fields: [
      text("projectsButton", "Projects button (hero)", "View our projects"),
    ],
  },
  {
    id: "home",
    title: "Home page",
    description: "The hero, figures, about text and 'Why choose us' points are in Site settings.",
    fields: [
      image("aboutImage", "About section photo", "If empty, a featured project's photo is used."),
      text("aboutButton", "About section button", "Talk to our team"),

      toggle("showWhy", "Show the 'Why choose us' section"),
      text("whyTitle", "'Why choose us' heading", "Why clients choose {company}"),
      area("whyIntro", "'Why choose us' text", "One accountable team from the first drawing to the keys, and a site you would be proud to visit."),
      image("whyImage", "'Why choose us' photo", "If empty, a featured project's photo is used."),

      toggle("showServices", "Show the services section"),
      text("servicesTitle", "Services heading", "What we build"),
      area("servicesIntro", "Services text", "One team runs design, permits and construction, from the first drawing to the handover."),

      toggle("showFeatured", "Show featured projects"),
      text("featuredTitle", "Featured projects heading", "Featured projects", "Choose which projects appear with 'Featured on the home page' on each project."),

      toggle("showFacts", "Show the project facts section"),
      text("factsTitle", "Project facts heading", "Project facts"),
      area("factsIntro", "Project facts text", "The numbers behind our recent work: size, scope and what was delivered."),

      toggle("showClients", "Show the clients' logos"),

      toggle("showNews", "Show the latest news"),
      text("homeNewsTitle", "Latest news heading", "Latest news", "The three most recent posts from News."),

      text("contactTitle", "Contact section heading", "Contact us"),
      area("contactIntro", "Contact section text", REPLY),
      image("contactImage", "Contact section background photo", "Shown dark behind the section. If empty, a project photo is used."),
      text("formTitle", "Contact form heading", "Send us a message"),
    ],
  },
  {
    id: "projects",
    title: "Projects page",
    fields: [
      text("projectsTitle", "Heading", "Our projects"),
      area("projectsIntro", "Text under the heading", "Homes, offices, warehouses and renovations we have designed and built."),
      image("projectsImage", "Header photo", "If empty, the first project's cover is used."),
      text("projectsEmpty", "Text when no project is published", "Projects will be published here soon."),
    ],
  },
  {
    id: "news",
    title: "News page",
    fields: [
      text("newsTitle", "Heading", "News"),
      area("newsIntro", "Text under the heading", "Contracts we have won, sites we have opened and projects we have handed over."),
      image("newsImage", "Header photo", "If empty, the latest post's photo is used."),
      text("newsEmpty", "Text when no news is published", "News will be published here soon."),
      text("newsTimelineTitle", "Project timeline heading", "Project timeline", "On a post and on a project's page: the project's news from the win to the handover."),
    ],
  },
  {
    id: "project",
    title: "Each project's page",
    description: "Headings shared by every project page. The project's own text, facts and photos are edited on the project.",
    fields: [
      text("projectAboutTitle", "Description heading", "About the project"),
      text("projectOverviewTitle", "Facts table heading", "Project overview"),
      text("projectHighlightsTitle", "Highlights heading", "What we delivered"),
      area("projectHighlightsIntro", "Highlights text", "The features, systems and finishes handed over on this project."),
      text("projectVideoTitle", "Video heading", "Video tour"),
      text("projectGalleryTitle", "Gallery heading", "Gallery"),
    ],
  },
  {
    id: "contact",
    title: "Contact page",
    fields: [
      text("contactPageTitle", "Heading", "Contact us"),
      area("contactPageIntro", "Text under the heading", REPLY),
      image("contactPageImage", "Photo beside the form", "If empty, a featured project's photo is used."),
      text("contactDetailsTitle", "Contact details heading", "Contact details"),
    ],
  },
  {
    id: "form",
    title: "Contact form",
    fields: [
      text("formButton", "Send button", "Send message"),
      text("formSuccessTitle", "Message after sending", "Thank you! We received your message."),
      text("formSuccessText", "Second line after sending", "Our team will get back to you shortly."),
    ],
  },
];

export const CONTENT_FIELDS = CONTENT_GROUPS.flatMap((g) => g.fields);

export type Content = Record<string, string> & {
  /** True when a toggle field is on. */
  on: (key: string) => boolean;
};

/** Saved values over the defaults, with {company} filled in. */
/**
 * Earlier defaults that asked for a quote or about a project. Saving the content page stores every field, so a saved
 * value equal to one of these was never written by the admin: it gets today's default instead.
 */
const RETIRED: Record<string, string[]> = {
  contactTitle: ["Have a project in mind?"],
  contactIntro: [
    "Tell us what you're building. We reply within one business day with next steps and a free estimate.",
    "Tell us what you're building. We reply within one business day.",
  ],
  formTitle: ["Request a free quote"],
  contactPageTitle: ["Request a quote"],
  contactPageIntro: [
    "Tell us about your project. We reply within one business day with next steps and a free estimate.",
    "Tell us about your project. We reply within one business day.",
  ],
  formButton: ["Request a free quote"],
  formSuccessTitle: ["Thank you! We received your request."],
};

/** True for a saved value that is an earlier default (see RETIRED): shown and used as unset. */
export function isRetiredDefault(key: string, value: string | undefined): boolean {
  return value !== undefined && !!RETIRED[key]?.includes(value);
}

export function resolveContent(saved: Record<string, string> | null | undefined, companyName: string): Content {
  const values: Record<string, string> = {};
  for (const f of CONTENT_FIELDS) {
    const v = saved?.[f.key];
    const unset = v === undefined || (f.kind !== "image" && f.kind !== "toggle" && v.trim() === "") || isRetiredDefault(f.key, v);
    const value = unset ? f.default : v;
    values[f.key] = f.kind === "text" || f.kind === "textarea" ? value.replaceAll("{company}", companyName) : value;
  }
  return Object.assign(values, { on: (key: string) => values[key] === "1" }) as Content;
}

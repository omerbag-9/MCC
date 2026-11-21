/**
 * The fields of Admin → Website content: each page's sections and their texts, photos and switches.
 *
 * This file only names the fields. Their wording lives in the database (settings.content, one JSON
 * object), written in the admin; the code holds no copy of it, so a text left empty is not shown.
 * Migration 0026 moved the wording the site showed until then into the database. In texts,
 * {company} is replaced by the company name. A switch never saved counts as on.
 */

export type ContentKind = "text" | "textarea" | "image" | "toggle";

export type ContentField = {
  key: string;
  label: string;
  kind: ContentKind;
  hint?: string;
  /** The site needs it (a form's only button): the admin refuses to save it empty. */
  required?: boolean;
};

/** Site settings columns that Website content edits beside a section's own fields. */
export type SettingsFieldKey =
  | "heroTitle"
  | "heroSubtitle"
  | "heroMode"
  | "heroImageKey"
  | "heroVideoKey"
  | "heroSlides"
  | "stats"
  | "aboutTitle"
  | "aboutBody"
  | "strengths";

/** One section of a page, as one card in Admin → Website content. */
export type ContentSection = {
  id: string;
  title: string;
  /** Where it is and what it shows, in a sentence. */
  description?: string;
  /** Where to see it on the site. */
  anchor?: string;
  /** The toggle field that shows or hides the whole section (shown as the card's switch). */
  toggle?: string;
  /** Site settings columns edited in this card too. */
  settings?: SettingsFieldKey[];
  /** The order of the card's fields (its own and its settings), as they appear on the site. */
  layout?: string[];
  /** What the section shows that is managed on another admin page. */
  elsewhere?: { label: string; href: string }[];
  /** Edited on that admin page, beside what it controls, instead of on Website content. */
  adminPage?: string;
  fields: ContentField[];
};

/** A page of the site: one tab in Admin → Website content. */
export type ContentPage = { id: string; title: string; href: string; description?: string; sections: ContentSection[] };

const text = (key: string, label: string, hint?: string): ContentField => ({ key, label, kind: "text", hint });
const area = (key: string, label: string, hint?: string): ContentField => ({ key, label, kind: "textarea", hint });
const image = (key: string, label: string, hint?: string): ContentField => ({ key, label, kind: "image", hint });
/** A switch; one never saved counts as on. */
const toggle = (key: string, label: string): ContentField => ({ key, label, kind: "toggle" });


export const CONTENT_PAGES: ContentPage[] = [
  {
    id: "home",
    title: "Home page",
    href: "/",
    sections: [
      {
        id: "hero",
        title: "Top of the page",
        description: "The first thing visitors see: the title, the photo, video or slideshow behind it, the button, and the three figures along its foot.",
        anchor: "/",
        settings: ["heroTitle", "heroSubtitle", "heroMode", "heroImageKey", "heroVideoKey", "heroSlides", "stats"],
        layout: ["heroTitle", "heroSubtitle", "projectsButton", "stats", "heroMode", "heroImageKey", "heroVideoKey", "heroSlides"],
        fields: [
          text("projectsButton", "Button text"),
        ],
      },
      {
        id: "about",
        title: "About",
        description: "The company in short, beside a photo. The full story is on the About page tab.",
        anchor: "/#about",
        settings: ["aboutTitle", "aboutBody"],
        layout: ["aboutTitle", "aboutBody", "aboutButton", "aboutImage"],
        fields: [
          image("aboutImage", "Photo", "If empty, a featured project's photo is used."),
          text("aboutButton", "Button text"),
        ],
      },
      {
        id: "why",
        title: "Why choose us",
        description: "A short text and photo beside the points that set the company apart.",
        anchor: "/#why-title",
        toggle: "showWhy",
        settings: ["strengths"],
        layout: ["whyTitle", "whyIntro", "strengths", "whyImage"],
        fields: [
          toggle("showWhy", "Show the 'Why choose us' section"),
          text("whyTitle", "Heading"),
          area("whyIntro", "Text"),
          image("whyImage", "Photo", "If empty, a featured project's photo is used."),
        ],
      },
      {
        id: "services",
        title: "Services",
        description: "The list of services, each with its photo.",
        anchor: "/#services",
        toggle: "showServices",
        elsewhere: [
          { label: "Add, edit and order the services", href: "/admin/services" },
        ],
        fields: [
          toggle("showServices", "Show the services section"),
          text("servicesTitle", "Heading"),
          area("servicesIntro", "Text"),
        ],
      },
      {
        id: "featured",
        title: "Featured projects",
        description: "One large and two smaller projects with their photos.",
        anchor: "/#projects",
        toggle: "showFeatured",
        elsewhere: [
          { label: "Choose the projects: tick 'Featured on the home page' on a project", href: "/admin/projects" },
        ],
        fields: [
          toggle("showFeatured", "Show featured projects"),
          text("featuredTitle", "Heading"),
        ],
      },
      {
        id: "facts",
        title: "Project facts",
        description: "Tabs of projects, each with a facts table, a photo and a button.",
        anchor: "/#facts-title",
        toggle: "showFacts",
        adminPage: "/admin/facts",
        fields: [
          toggle("showFacts", "Show the project facts section on the home page"),
          text("factsTitle", "Heading"),
          area("factsIntro", "Text beside the heading"),
        ],
      },
      {
        id: "clients",
        title: "Clients",
        description: "The clients' logos moving across the page.",
        anchor: "/#clients-title",
        toggle: "showClients",
        elsewhere: [
          { label: "Add, edit and order the logos", href: "/admin/clients" },
        ],
        fields: [
          toggle("showClients", "Show the clients' logos"),
        ],
      },
      {
        id: "homeNews",
        title: "Latest news",
        description: "The three most recent news posts.",
        anchor: "/#news-title",
        toggle: "showNews",
        elsewhere: [
          { label: "Write and edit news posts", href: "/admin/news" },
        ],
        fields: [
          toggle("showNews", "Show the latest news"),
          text("homeNewsTitle", "Heading"),
        ],
      },
      {
        id: "contact",
        title: "Contact",
        description: "The last section: how to reach the company, beside the contact form.",
        anchor: "/#contact",
        elsewhere: [
          { label: "Phone, email and address", href: "/admin/settings#contact" },
          { label: "The form's button and messages", href: "/admin/content?page=contact#form" },
        ],
        fields: [
          text("contactTitle", "Heading"),
          area("contactIntro", "Text"),
          text("formTitle", "Form heading"),
          image("contactImage", "Background photo", "Shown dark behind the section. If empty, a project photo is used."),
        ],
      },
    ],
  },
  {
    id: "about",
    title: "About page",
    href: "/about",
    description: "Separate paragraphs with an empty line.",
    sections: [
      {
        id: "aboutHeader",
        title: "Header",
        description: "The title and photo at the top of the page.",
        anchor: "/about",
        fields: [
          text("aboutPageTitle", "Heading"),
          area("aboutPageIntro", "Text under the heading"),
          image("aboutPageImage", "Photo", "If empty, a featured project's photo is used."),
          text("aboutFact1Value", "Figure 1"),
          text("aboutFact1Label", "Figure 1: what it counts"),
          text("aboutFact2Value", "Figure 2"),
          text("aboutFact2Label", "Figure 2: what it counts"),
        ],
      },
      {
        id: "aboutStory",
        title: "Who we are",
        description: "The company story, with a small table of company facts, beside a photo.",
        anchor: "/about",
        fields: [
          text("aboutStoryTitle", "Heading"),
          area("aboutStory", "Text"),
          image("aboutStoryImage", "Photo", "If empty, a featured project's photo is used."),
          text("aboutLegal", "Company type"),
          text("aboutOwners", "Owners"),
          text("aboutScope", "What we do"),
        ],
      },
      {
        id: "aboutAims",
        title: "Mission and vision",
        description: "Each statement large on the left, the text behind it on the right.",
        anchor: "/about#mission",
        fields: [
          text("aboutMissionTitle", "Mission heading"),
          area("aboutMissionLead", "Mission statement", "Shown large, under the heading."),
          area("aboutMission", "Mission text"),
          text("aboutVisionTitle", "Vision heading"),
          area("aboutVisionLead", "Vision statement", "Shown large, under the heading."),
          area("aboutVision", "Vision text"),
        ],
      },
      {
        id: "aboutValues",
        title: "Core values",
        description: "The four values beside a photo, on navy.",
        anchor: "/about#values-title",
        fields: [
          text("aboutValuesTitle", "Heading"),
          image("aboutValuesImage", "Photo", "Beside the values. If empty, a featured project's photo is used."),
          text("value1Title", "Value 1"),
          area("value1Text", "Value 1 text"),
          text("value2Title", "Value 2"),
          area("value2Text", "Value 2 text"),
          text("value3Title", "Value 3"),
          area("value3Text", "Value 3 text"),
          text("value4Title", "Value 4"),
          area("value4Text", "Value 4 text"),
        ],
      },
      {
        id: "aboutClose",
        title: "Closing",
        description: "The closing line and the contact button, over a dark photo.",
        anchor: "/about",
        fields: [
          text("aboutClosing", "Closing line"),
          text("aboutPageButton", "Button text"),
          image("aboutClosingImage", "Background photo", "Shown dark behind the closing line. If empty, a project photo is used."),
        ],
      },
    ],
  },
  {
    id: "projects",
    title: "Projects page",
    href: "/projects",
    sections: [
      {
        id: "projectsPage",
        title: "Projects page",
        description: "The header above the list of all projects.",
        anchor: "/projects",
        elsewhere: [
          { label: "Add and edit projects", href: "/admin/projects" },
        ],
        fields: [
          text("projectsTitle", "Heading"),
          area("projectsIntro", "Text under the heading"),
          image("projectsImage", "Header photo", "If empty, the first project's cover is used."),
          text("projectsEmpty", "Text when no project is published"),
        ],
      },
      {
        id: "project",
        title: "Every project page",
        description: "Headings shared by all project pages. Each project's own text, facts and photos are edited on the project.",
        elsewhere: [
          { label: "A project's text, facts and photos", href: "/admin/projects" },
        ],
        fields: [
          text("projectAboutTitle", "Description heading"),
          text("projectOverviewTitle", "Facts table heading"),
          text("projectHighlightsTitle", "Highlights heading"),
          area("projectHighlightsIntro", "Highlights text"),
          text("projectVideoTitle", "Video heading"),
          text("projectGalleryTitle", "Gallery heading"),
        ],
      },
    ],
  },
  {
    id: "news",
    title: "News page",
    href: "/news",
    sections: [
      {
        id: "newsPage",
        title: "News page",
        description: "The header above the news posts, and the timeline heading on posts and project pages.",
        anchor: "/news",
        elsewhere: [
          { label: "Write and edit news posts", href: "/admin/news" },
        ],
        fields: [
          text("newsTitle", "Heading"),
          area("newsIntro", "Text under the heading"),
          image("newsImage", "Header photo", "If empty, the latest post's photo is used."),
          text("newsEmpty", "Text when no news is published"),
          text("newsTimelineTitle", "Project timeline heading", "On a post and on a project's page: the project's news from the win to the handover."),
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact page",
    href: "/contact",
    sections: [
      {
        id: "contactPage",
        title: "Contact page",
        description: "The form on one side, a photo with the contact details on the other.",
        anchor: "/contact",
        elsewhere: [
          { label: "Phone, email, address, hours and map", href: "/admin/settings#contact" },
        ],
        fields: [
          text("contactPageTitle", "Heading"),
          area("contactPageIntro", "Text under the heading"),
          image("contactPageImage", "Photo beside the form", "If empty, a featured project's photo is used."),
          text("contactDetailsTitle", "Contact details heading"),
        ],
      },
      {
        id: "form",
        title: "Contact form",
        description: "The form on this page and at the foot of the home page.",
        anchor: "/contact",
        fields: [
          { ...text("formButton", "Send button"), required: true },
          text("formSuccessTitle", "Message after sending"),
          text("formSuccessText", "Second line after sending"),
        ],
      },
    ],
  },
];

/** Every section, in page order. */
export const CONTENT_SECTIONS = CONTENT_PAGES.flatMap((p) => p.sections);

export const CONTENT_FIELDS = CONTENT_SECTIONS.flatMap((s) => s.fields);

export type Content = Record<string, string> & {
  /** True when a switch is on (a switch never saved counts as on). */
  on: (key: string) => boolean;
};

/** The saved values, with {company} filled in. A text not saved is empty. */
export function resolveContent(saved: Record<string, string> | null | undefined, companyName: string): Content {
  const values: Record<string, string> = {};
  for (const f of CONTENT_FIELDS) {
    const v = saved?.[f.key];
    if (f.kind === "toggle") values[f.key] = v === "0" ? "0" : "1";
    else if (f.kind === "image") values[f.key] = v ?? "";
    else values[f.key] = (v ?? "").replaceAll("{company}", companyName);
  }
  return Object.assign(values, { on: (key: string) => values[key] === "1" }) as Content;
}

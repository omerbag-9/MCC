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

/** Site settings columns that Website content edits beside a section's own fields. */
export type SettingsFieldKey = "heroTitle" | "heroSubtitle" | "heroImageKey" | "heroVideoKey" | "stats" | "aboutTitle" | "aboutBody" | "strengths";

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

const text = (key: string, label: string, value: string, hint?: string): ContentField => ({ key, label, kind: "text", default: value, hint });
const area = (key: string, label: string, value: string, hint?: string): ContentField => ({ key, label, kind: "textarea", default: value, hint });
const image = (key: string, label: string, hint?: string): ContentField => ({ key, label, kind: "image", default: "", hint });
const toggle = (key: string, label: string, on = true): ContentField => ({ key, label, kind: "toggle", default: on ? "1" : "0" });

const REPLY = "Send us a message and we will get back to you within one business day.";

export const CONTENT_PAGES: ContentPage[] = [
  {
    id: "home",
    title: "Home page",
    href: "/",
    sections: [
      {
        id: "hero",
        title: "Top of the page",
        description: "The first thing visitors see: the title, the photo or video behind it, the button, and the three figures along its foot.",
        anchor: "/",
        settings: ["heroTitle", "heroSubtitle", "heroImageKey", "heroVideoKey", "stats"],
        layout: ["heroTitle", "heroSubtitle", "projectsButton", "stats", "heroImageKey", "heroVideoKey"],
        fields: [
          text("projectsButton", "Button text", "View our projects"),
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
          text("aboutButton", "Button text", "Talk to our team"),
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
          text("whyTitle", "Heading", "Why clients choose {company}"),
          area("whyIntro", "Text", "One accountable team from the first drawing to the keys, and a site you would be proud to visit."),
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
          text("servicesTitle", "Heading", "What we build"),
          area("servicesIntro", "Text", "One team runs design, permits and construction, from the first drawing to the handover."),
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
          text("featuredTitle", "Heading", "Featured projects"),
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
          text("factsTitle", "Heading", "Project facts"),
          area("factsIntro", "Text beside the heading", "The numbers behind our recent work: size, scope and what was delivered."),
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
          text("homeNewsTitle", "Heading", "Latest news"),
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
          text("contactTitle", "Heading", "Contact us"),
          area("contactIntro", "Text", REPLY),
          text("formTitle", "Form heading", "Send us a message"),
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
          text("aboutPageTitle", "Heading", "Beyond contracting. Driven by engineering."),
          area(
        "aboutPageIntro",
        "Text under the heading",
        "MCC is an engineering-driven contracting company specializing in electromechanical solutions and integrated construction services.",
      ),
          image("aboutPageImage", "Photo", "If empty, a featured project's photo is used."),
        ],
      },
      {
        id: "aboutStory",
        title: "Who we are",
        description: "The company story, with a small table of company facts, beside a photo.",
        anchor: "/about",
        fields: [
          text("aboutStoryTitle", "Heading", "About MCC"),
          area(
        "aboutStory",
        "Text",
        [
          "Established in 2015, MCC began its journey as a specialized electromechanical contracting company, building its reputation on engineering expertise, technical precision, and commitment to quality.",
          "Over the past three years, the company has strategically expanded its capabilities into comprehensive finishing works, broadening its scope of services and strengthening its position in the construction market.",
          "Today, MCC is entering a new phase of growth, with a strategic vision to evolve into an integrated group of specialized companies, each bringing focused expertise and delivering complementary solutions under one unified vision.",
        ].join("\n\n"),
      ),
          image("aboutStoryImage", "Photo", "If empty, a featured project's photo is used."),
          text("aboutLegal", "Company type", "Limited Liability Company (LTD)"),
          text("aboutOwners", "Owners", "Eng. Karim Osama and Eng. Mohamed Abdelhakim"),
          text("aboutScope", "What we do", "Electromechanical works and comprehensive finishing works"),
        ],
      },
      {
        id: "aboutAims",
        title: "Mission and vision",
        description: "Each statement large on the left, the text behind it on the right.",
        anchor: "/about#mission",
        fields: [
          text("aboutMissionTitle", "Mission heading", "Our mission"),
          area("aboutMissionLead", "Mission statement", "To bring engineering excellence into every aspect of construction.", "Shown large, under the heading."),
          area(
        "aboutMission",
        "Mission text",
        [
          "At MCC, engineering is not simply part of what we do; it is the foundation of how we think, plan, and execute.",
          "We approach every project with an engineering mindset, combining technical knowledge, accurate cost analysis, precise calculations, and disciplined execution to ensure that every solution achieves its intended purpose.",
          "Our commitment goes beyond project completion. We strive to deliver superior quality, meet project timelines, and provide reliable after-completion support and maintenance.",
          "Our mission is to deliver projects that reflect professional standards, engineering integrity, and lasting value.",
        ].join("\n\n"),
      ),
          text("aboutVisionTitle", "Vision heading", "Our vision"),
          area(
        "aboutVisionLead",
        "Vision statement",
        "To become a leading engineering and contracting group recognized for its expertise, people, and quality of delivery.",
        "Shown large, under the heading.",
      ),
          area(
        "aboutVision",
        "Vision text",
        [
          "We believe that our greatest competitive advantage lies in our people.",
          "MCC is built around a dedicated team of engineers, most of whom are graduates of leading Egyptian public universities, bringing strong academic foundations and practical engineering experience.",
          "With the majority of our engineering team having been part of MCC for more than a decade, we have developed a strong foundation of accumulated knowledge, professional consistency, and shared commitment.",
          "We aim to continuously elevate our standards, expand our capabilities, and deliver projects that set a higher benchmark for quality and professionalism in the market.",
        ].join("\n\n"),
      ),
        ],
      },
      {
        id: "aboutValues",
        title: "Core values",
        description: "The four values beside a photo, on navy.",
        anchor: "/about#values-title",
        fields: [
          text("aboutValuesTitle", "Heading", "Our core values"),
          image("aboutValuesImage", "Photo", "Beside the values. If empty, a featured project's photo is used."),
          text("value1Title", "Value 1", "Engineering-driven thinking"),
          area(
        "value1Text",
        "Value 1 text",
        "We approach construction through engineering principles, technical understanding, and systematic problem-solving. Our decisions are guided by engineering logic rather than conventional contracting practices.",
      ),
          text("value2Title", "Value 2", "Precision in every detail"),
          area(
        "value2Text",
        "Value 2 text",
        "We believe that successful projects begin with accurate planning. From cost estimation and technical calculations to procurement and execution, precision is embedded in every stage of our work.",
      ),
          text("value3Title", "Value 3", "Commitment beyond delivery"),
          area(
        "value3Text",
        "Value 3 text",
        "Our responsibility does not end at project handover. We are committed to delivering quality on schedule and providing the necessary support and maintenance to ensure long-term performance.",
      ),
          text("value4Title", "Value 4", "People are our strength"),
          area(
        "value4Text",
        "Value 4 text",
        "Our team is the foundation of our success. We invest in long-term professional relationships, accumulated experience, and a collaborative engineering culture that drives continuous improvement and sustainable growth.",
      ),
        ],
      },
      {
        id: "aboutClose",
        title: "Closing",
        description: "The closing line and the contact button, over a dark photo.",
        anchor: "/about",
        fields: [
          text("aboutClosing", "Closing line", "Engineering excellence, technical precision, commitment to quality."),
          text("aboutPageButton", "Button text", "Talk to our team"),
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
          text("projectsTitle", "Heading", "Our projects"),
          area("projectsIntro", "Text under the heading", "Homes, offices, warehouses and renovations we have designed and built."),
          image("projectsImage", "Header photo", "If empty, the first project's cover is used."),
          text("projectsEmpty", "Text when no project is published", "Projects will be published here soon."),
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
          text("projectAboutTitle", "Description heading", "About the project"),
          text("projectOverviewTitle", "Facts table heading", "Project overview"),
          text("projectHighlightsTitle", "Highlights heading", "What we delivered"),
          area("projectHighlightsIntro", "Highlights text", "The features, systems and finishes handed over on this project."),
          text("projectVideoTitle", "Video heading", "Video tour"),
          text("projectGalleryTitle", "Gallery heading", "Gallery"),
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
          text("newsTitle", "Heading", "News"),
          area("newsIntro", "Text under the heading", "Contracts we have won, sites we have opened and projects we have handed over."),
          image("newsImage", "Header photo", "If empty, the latest post's photo is used."),
          text("newsEmpty", "Text when no news is published", "News will be published here soon."),
          text("newsTimelineTitle", "Project timeline heading", "Project timeline", "On a post and on a project's page: the project's news from the win to the handover."),
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
          text("contactPageTitle", "Heading", "Contact us"),
          area("contactPageIntro", "Text under the heading", REPLY),
          image("contactPageImage", "Photo beside the form", "If empty, a featured project's photo is used."),
          text("contactDetailsTitle", "Contact details heading", "Contact details"),
        ],
      },
      {
        id: "form",
        title: "Contact form",
        description: "The form on this page and at the foot of the home page.",
        anchor: "/contact",
        fields: [
          text("formButton", "Send button", "Send message"),
          text("formSuccessTitle", "Message after sending", "Thank you! We received your message."),
          text("formSuccessText", "Second line after sending", "Our team will get back to you shortly."),
        ],
      },
    ],
  },
];

/** Every section, in page order. */
export const CONTENT_SECTIONS = CONTENT_PAGES.flatMap((p) => p.sections);

export const CONTENT_FIELDS = CONTENT_SECTIONS.flatMap((s) => s.fields);

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
  // The About page's first wording (replaced by the client's revised profile).
  aboutPageTitle: ["Engineers, not ordinary contractors"],
  aboutPageIntro: ["MCC is a contracting company specialized in electromechanical works and full finishing, run by engineers since 2015."],
  aboutStoryTitle: ["Who we are"],
  aboutStory: [
    [
      "Founded in 2015, MCC started in electromechanical contracting. In the last 3 years, we expanded into full finishing works.",
      "Today, we are moving to build MCC as a group, with specialized companies under it, to deliver a different product in the market.",
    ].join("\n\n"),
  ],
  aboutMission: [
    [
      "We are engineers working with a pure engineering background. We are not ordinary contractors, we are people who work with engineering thinking.",
      "Our goal is to deliver high-quality work, on time, and to maintain the work after we finish it, to deliver in the end a respectable product. For every project we take on, we ensure accurate costing, precise calculations, and precise execution, to deliver the intended outcome.",
    ].join("\n\n"),
  ],
  aboutVision: [
    [
      "What distinguishes MCC is our team. Most of our engineers graduated from excellent government universities, and most of them have been with the company for more than 10 years.",
      "We work with disciplined engineering, and we aim to present work that stands out from what is available in the market.",
    ].join("\n\n"),
  ],
  aboutValuesTitle: ["Our values"],
  value1Title: ["We think like engineers"],
  value1Text: ["We are not ordinary contractors. We work with pure engineering thinking, not traditional contracting."],
  value2Title: ["We do things right"],
  value2Text: ["Accurate costing, precise calculations and precise execution, in every project we take on."],
  value3Title: ["We deliver and we maintain"],
  value3Text: ["High-quality work, on time, and we maintain the work after we finish it, to deliver a respectable product."],
  value4Title: ["We grow with our people"],
  value4Text: ["Our team is our distinction. Most of our engineers are from excellent government universities, and most of them have been with us for more than 10 years."],
  aboutClosing: ["Not ordinary contractors. Engineers with an engineering background."],
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

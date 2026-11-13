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
    id: "about",
    title: "About page",
    description: "The page at /about. The short version on the home page is the About text in Site settings. In longer texts, separate paragraphs with an empty line.",
    fields: [
      text("aboutPageTitle", "Heading", "Beyond contracting. Driven by engineering."),
      area(
        "aboutPageIntro",
        "Text under the heading",
        "MCC is an engineering-driven contracting company specializing in electromechanical solutions and integrated construction services.",
      ),
      image("aboutPageImage", "Header photo", "If empty, a featured project's photo is used."),

      text("aboutStoryTitle", "Story heading", "About MCC"),
      area(
        "aboutStory",
        "Story text",
        [
          "Established in 2015, MCC began its journey as a specialized electromechanical contracting company, building its reputation on engineering expertise, technical precision, and commitment to quality.",
          "Over the past three years, the company has strategically expanded its capabilities into comprehensive finishing works, broadening its scope of services and strengthening its position in the construction market.",
          "Today, MCC is entering a new phase of growth, with a strategic vision to evolve into an integrated group of specialized companies, each bringing focused expertise and delivering complementary solutions under one unified vision.",
        ].join("\n\n"),
      ),
      image("aboutStoryImage", "Story photo", "If empty, a featured project's photo is used."),
      text("aboutLegal", "Company type", "Limited Liability Company (LTD)"),
      text("aboutOwners", "Owners", "Eng. Karim Osama and Eng. Mohamed Abdelhakim"),
      text("aboutScope", "What we do", "Electromechanical works and comprehensive finishing works"),

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

      text("aboutValuesTitle", "Values heading", "Our core values"),
      image("aboutValuesImage", "Values photo", "Beside the values. If empty, a featured project's photo is used."),
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

      text("aboutClosing", "Closing line", "Engineering excellence, technical precision, commitment to quality."),
      text("aboutPageButton", "Closing button", "Talk to our team"),
      image("aboutClosingImage", "Closing section background photo", "Shown dark behind the closing line. If empty, a project photo is used."),
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

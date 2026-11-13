import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/site/icons";
import { Photo, photoPool } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { getContent, getFeaturedProjects, getSettings } from "@/lib/db/queries";
import { getMediaBase } from "@/lib/env";
import { paragraphs } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: "About us",
    description: c.aboutPageIntro,
    alternates: { canonical: "/about" },
  };
}

// The company's own facts from its profile, shown along the foot of the header.
const RECORD = [
  { value: "2015", label: "Established" },
  { value: "10+ years", label: "Most of our engineers with us" },
  { value: "LTD", label: "Owned by its engineers" },
];

export default async function AboutPage() {
  const [settings, c, featured, mediaBase] = await Promise.all([getSettings(), getContent(), getFeaturedProjects(), getMediaBase()]);

  const pool = photoPool(...featured.map((p) => p.coverKey), settings.heroImageKey);
  const heroPhoto = c.aboutPageImage || pool.next();
  const storyPhoto = c.aboutStoryImage || (pool.next() ?? heroPhoto);
  const closingPhoto = c.aboutClosingImage || pool.any(2);

  const story = paragraphs(c.aboutStory);
  const company = [
    { label: "Company", value: c.aboutLegal },
    { label: "Owners", value: c.aboutOwners },
    { label: "What we do", value: c.aboutScope },
  ].filter((f) => f.value);
  const aims = [
    { id: "mission", title: c.aboutMissionTitle, lead: c.aboutMissionLead, body: paragraphs(c.aboutMission) },
    { id: "vision", title: c.aboutVisionTitle, lead: c.aboutVisionLead, body: paragraphs(c.aboutVision) },
  ].filter((a) => a.lead || a.body.length > 0);
  const values = [1, 2, 3, 4].map((n) => ({ title: c[`value${n}Title`], text: c[`value${n}Text`] })).filter((v) => v.title);

  return (
    <>
      {/* Header: a photograph of the work under a veil, the claim, and the company's dates along its foot */}
      <section className="relative isolate flex min-h-[420px] flex-col overflow-hidden bg-ink text-paper lg:min-h-[min(620px,calc(78svh-72px))]">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={heroPhoto} alt="" sizes="100vw" priority className="hero-photo" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/70" />
        <Reveal className="container-x flex flex-1 flex-col justify-center py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-small text-on-navy-muted">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-paper">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-paper">About us</li>
            </ol>
          </nav>
          <h1 className="mt-5 max-w-4xl text-display font-semibold">{c.aboutPageTitle}</h1>
          <p className="mt-5 max-w-xl text-lead text-paper/90">{c.aboutPageIntro}</p>
        </Reveal>
        <div className="bg-ink">
          <Reveal className="container-x grid grid-cols-3 gap-4 py-6 lg:py-8" stagger={0.06} onLoad delay={0.3}>
            {RECORD.map((r) => (
              <dl key={r.label} className="min-w-0">
                <dt className="sr-only">{r.label}</dt>
                <dd className="text-[clamp(1.25rem,0.9rem+1.8vw,2.5rem)] leading-none font-semibold tracking-tight tabular-nums">{r.value}</dd>
                <dd className="mt-2 text-small text-on-navy-muted sm:text-body">{r.label}</dd>
              </dl>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Who we are: the story and the company's make-up, beside a photograph */}
      <section className="section-y" aria-labelledby="story-title">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <h2 id="story-title" className="text-head font-semibold">{c.aboutStoryTitle}</h2>
            {story.map((p, i) => (
              <p key={i} className={i === 0 ? "mt-6 text-lead" : "mt-4"}>
                {p}
              </p>
            ))}
            {company.length > 0 && (
              <dl className="mt-10 grid gap-1">
                {company.map((f) => (
                  <div key={f.label} className="grid gap-1 bg-sand px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="text-small text-muted">{f.label}</dt>
                    <dd className="font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>
          <Reveal className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden bg-ink lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <Photo mediaBase={mediaBase} src={storyPhoto} alt={`${settings.companyName} on site`} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission and vision: two panels on a tone step */}
      {aims.length > 0 && (
        <section className="section-y bg-sand" aria-label={aims.map((a) => a.title).join(" and ")}>
          <Reveal className="container-x grid gap-1 lg:grid-cols-2" stagger={0.1}>
            {aims.map((a) => (
              <article key={a.id} id={a.id} className="bg-paper p-8 sm:p-10 lg:p-14">
                <h2 className="text-lead font-semibold text-muted">{a.title}</h2>
                {a.lead && <p className="mt-4 text-[1.375rem] leading-snug font-semibold text-balance sm:text-[1.5rem]">{a.lead}</p>}
                {a.body.map((t, i) => (
                  <p key={i} className={i === 0 ? "mt-8" : "mt-4"}>
                    {t}
                  </p>
                ))}
              </article>
            ))}
          </Reveal>
        </section>
      )}

      {/* Values: the heading beside the four principles, on navy */}
      {values.length > 0 && (
        <section className="section-y bg-ink text-paper" aria-labelledby="values-title">
          <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <h2 id="values-title" className="text-head font-semibold">{c.aboutValuesTitle}</h2>
            </Reveal>
            <Reveal className="grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:col-span-8" stagger={0.08}>
              {values.map((v) => (
                <div key={v.title}>
                  <h3 className="text-[clamp(1.375rem,1.1rem+0.8vw,1.75rem)] leading-tight font-semibold tracking-tight">{v.title}</h3>
                  {v.text && <p className="mt-4 text-paper/85">{v.text}</p>}
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Close: the line the company signs with, and the way to reach us, over a photograph */}
      <section className="relative isolate overflow-hidden bg-ink text-paper" aria-label="Work with us">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={closingPhoto} alt="" sizes="100vw" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/85" />
        <Reveal className="container-x section-y grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <p className="max-w-3xl text-[1.5rem] leading-tight font-semibold text-balance sm:text-head lg:col-span-8">{c.aboutClosing}</p>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Link href="/contact" className="btn-light">
              {c.aboutPageButton} <ArrowRightIcon width={18} height={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

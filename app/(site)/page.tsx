import type { Metadata } from "next";
import Link from "next/link";
import SplitText from "@/components/reactbits/SplitText";
import { ClientsLoop } from "@/components/site/clients-loop";
import { HeroVideo } from "@/components/site/hero-video";
import { ArrowRightIcon, PhoneIcon, WhatsAppIcon } from "@/components/site/icons";
import { Photo, photoPool } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";
import { ServicesExplorer } from "@/components/site/services-explorer";
import { Stat } from "@/components/site/stat";
import { WhatsAppLink } from "@/components/site/whatsapp";
import {
  getClients,
  getFeaturedProjects,
  getPublishedServices,
  getSettings,
} from "@/lib/db/queries";
import { getMediaBase, getSiteUrl } from "@/lib/env";
import { paragraphs } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const thumbOf = (key: string | null) => (key ? key.replace(/\.(\w+)$/, "-thumb.$1") : null);

export default async function HomePage() {
  const [settings, services, featured, clients, mediaBase, siteUrl] = await Promise.all([
    getSettings(),
    getPublishedServices(),
    getFeaturedProjects(),
    getClients(),
    getMediaBase(),
    getSiteUrl(),
  ]);

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const pool = photoPool(settings.heroImageKey, ...featured.map((p) => p.coverKey));
  const heroPhoto = pool.next();
  const aboutPhoto = pool.next() ?? heroPhoto;
  const ctaPhoto = pool.any(3);
  const about = paragraphs(settings.aboutBody);
  const stats = settings.stats.slice(0, 3);
  const [firstStat] = stats;
  const heroVideo = mediaUrl(settings.heroVideoKey, mediaBase);
  const showcase = featured.slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd(settings, siteUrl, mediaBase))} />

      {/* Hero: video (or the photograph) under a veil, the claim, two actions; the figures close the
          first screen, so hero and figures together fill exactly one screen. */}
      <section className="relative isolate flex min-h-[calc(100svh-72px)] flex-col overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 -z-20">
          {heroVideo ? (
            <HeroVideo src={heroVideo} poster={mediaUrl(heroPhoto, mediaBase)} />
          ) : (
            <Photo mediaBase={mediaBase} src={heroPhoto} alt={settings.companyName} sizes="100vw" priority className="hero-photo" />
          )}
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/60" />
        <div className="container-x flex flex-1 flex-col justify-center py-8 sm:py-14 lg:py-20">
          <div className="max-w-3xl">
            <SplitText
              tag="h1"
              text={settings.heroTitle || settings.companyName}
              className="text-display font-semibold"
              splitType="words"
              delay={60}
              duration={0.9}
              from={{ opacity: 0, y: 28 }}
              to={{ opacity: 1, y: 0 }}
              trigger="load"
              textAlign="left"
            />
            {settings.heroSubtitle && (
              <Reveal delay={0.35}>
                <p className="mt-6 max-w-xl text-lead text-paper/90">{settings.heroSubtitle}</p>
              </Reveal>
            )}
            <Reveal delay={0.5} className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-light">
                Request a quote
              </Link>
              <Link href="/projects" className="btn-outline">
                View our projects <ArrowRightIcon width={18} height={18} />
              </Link>
            </Reveal>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="bg-ink">
            <Reveal className="container-x grid grid-cols-3 gap-4 py-6 sm:py-8 lg:py-10" stagger={0.08} onLoad delay={0.6}>
              {stats.map((s) => (
                <dl key={s.label} className="min-w-0">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-[clamp(1.375rem,0.9rem+2.4vw,3.25rem)] leading-none font-semibold tracking-tight tabular-nums">
                    <Stat value={s.value} />
                  </dd>
                  <dd className="mt-2 text-small text-on-navy-muted sm:text-body">{s.label}</dd>
                </dl>
              ))}
            </Reveal>
          </div>
        )}
      </section>

      {/* About: photograph with the first figure set on it, and the story beside it */}
      <section id="about" className="section-y">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="relative lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden bg-ink">
              <Photo mediaBase={mediaBase} src={aboutPhoto} alt={`${settings.companyName} at work`} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            {firstStat && (
              <div className="bg-ink px-7 py-6 text-paper sm:absolute sm:right-0 sm:bottom-0 sm:w-56">
                <p className="text-head font-semibold">{firstStat.value}</p>
                <p className="mt-1 text-small text-on-navy-muted">{firstStat.label}</p>
              </div>
            )}
          </Reveal>
          <Reveal className="lg:col-span-6">
            <h2 className="text-head font-semibold">{settings.aboutTitle || `About ${settings.companyName}`}</h2>
            {about.map((p, i) => (
              <p key={i} className={i === 0 ? "mt-6 text-lead" : "mt-4"}>
                {p}
              </p>
            ))}
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/contact" className="btn-primary">
                Talk to our team
              </Link>
              <Link href="/#services" className="link-arrow">
                Our services <ArrowRightIcon width={18} height={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services: the list and the selected service's photograph, on navy */}
      {services.length > 0 && (
        <section id="services" className="section-y bg-ink text-paper">
          <div className="container-x">
            <Reveal className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 className="text-head font-semibold lg:col-span-5">What we build</h2>
              <p className="max-w-xl text-on-navy-muted lg:col-span-7">
                One team runs design, permits and construction, from the first drawing to the handover.
              </p>
            </Reveal>
            <Reveal>
              <ServicesExplorer
                items={services.map((s) => ({
                  id: s.id,
                  title: s.title,
                  description: s.description,
                  src: mediaUrl(s.imageKey, mediaBase),
                  thumb: mediaUrl(thumbOf(s.imageKey), mediaBase),
                }))}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* Projects: one large and two smaller, each captioned on a navy panel */}
      {showcase.length > 0 && (
        <section id="projects" className="section-y">
          <div className="container-x">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2 className="text-head font-semibold">Featured projects</h2>
              <Link href="/projects" className="link-arrow">
                All projects <ArrowRightIcon width={18} height={18} />
              </Link>
            </Reveal>
            <Reveal className="grid gap-4 lg:h-[clamp(360px,calc(100svh-260px),520px)] lg:grid-cols-12 lg:grid-rows-2" stagger={0.1}>
              {showcase.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className={`group relative block overflow-hidden bg-ink ${i === 0 ? "aspect-[16/10] lg:col-span-7 lg:row-span-2 lg:aspect-auto" : "aspect-[16/10] lg:col-span-5 lg:aspect-auto"}`}
                >
                  <div className="absolute inset-0">
                    <Photo
                      mediaBase={mediaBase}
                      src={p.coverKey}
                      alt={p.title}
                      sizes={i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 max-w-[85%] bg-ink px-6 py-5 text-paper">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1 text-small text-on-navy-muted">{[p.category, p.location, p.year].filter(Boolean).join(" · ")}</p>
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Clients: their logos moving slowly across the page, nothing else */}
      {clients.length > 0 && (
        <section className="py-14 lg:py-20" aria-labelledby="clients-title">
          <h2 id="clients-title" className="sr-only">Trusted by</h2>
          <ClientsLoop
            clients={clients.map((c) => ({ id: c.id, name: c.name, url: c.url, logo: mediaUrl(c.logoKey, mediaBase) }))}
          />
        </section>
      )}

      {/* Call to action on navy over a photograph */}
      <section id="contact" className="relative isolate overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={ctaPhoto} alt="" sizes="100vw" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/85" />
        <Reveal className="container-x grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:py-20">
          <div className="lg:col-span-7">
            <h2 className="text-head font-semibold">Planning a project?</h2>
            <p className="mt-4 max-w-xl text-on-navy-muted">
              Tell us what you&apos;re building. We reply within one business day with next steps and a free estimate.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link href="/contact" className="btn-light">Request a free quote</Link>
            {wa && (
              <WhatsAppLink href={wa} className="btn-whatsapp">
                <WhatsAppIcon width={18} height={18} /> WhatsApp
              </WhatsAppLink>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn-outline">
                <PhoneIcon width={18} height={18} /> {settings.phone}
              </a>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}

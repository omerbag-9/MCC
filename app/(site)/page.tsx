import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/site/icons";
import { Photo, photoPool } from "@/components/site/photo";
import { ProjectStrip } from "@/components/site/project-strip";
import { Reveal } from "@/components/site/reveal";
import { Stat } from "@/components/site/stat";
import { WhatsAppLink } from "@/components/site/whatsapp";
import {
  getClients,
  getFeaturedProjects,
  getPublishedServices,
  getPublishedTestimonials,
  getSettings,
} from "@/lib/db/queries";
import { getMediaBase, getSiteUrl } from "@/lib/env";
import { paragraphs } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const SERVICE_SHAPES = ["aspect-[4/5] w-full", "aspect-[3/2] w-full", "aspect-square w-4/5 ml-auto"];

export default async function HomePage() {
  const [settings, services, featured, testimonials, clients, mediaBase, siteUrl] = await Promise.all([
    getSettings(),
    getPublishedServices(),
    getFeaturedProjects(),
    getPublishedTestimonials(),
    getClients(),
    getMediaBase(),
    getSiteUrl(),
  ]);

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const heroProject = settings.heroImageKey ? null : (featured.find((p) => p.coverKey) ?? null);
  const pool = photoPool(settings.heroImageKey, ...featured.map((p) => p.coverKey));
  const heroPhoto = pool.next();
  const aboutPhoto = pool.next();
  const quotePhoto = pool.next();
  const contactPhoto = pool.next();
  const about = paragraphs(settings.aboutBody);
  const [quote, ...moreQuotes] = testimonials;
  const withPhoto = services.filter((s) => s.imageKey);
  const withoutPhoto = services.filter((s) => !s.imageKey);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd(settings, siteUrl, mediaBase))} />

      {/* Hero: one photograph, the name and one line, one action */}
      <section className="relative isolate flex h-[100svh] min-h-[600px] flex-col justify-end overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 -z-20">
          <Photo
            mediaBase={mediaBase}
            src={heroPhoto}
            alt={heroProject ? heroProject.title : settings.companyName}
            sizes="100vw"
            priority
            className="hero-photo"
          />
        </div>
        {/* neutral scrim for legibility */}
        <div className="absolute inset-0 -z-10 bg-black/40" />
        <div className="container-x pb-14 lg:pb-20">
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-10">
            <div className="max-w-3xl">
              <h1 className="text-display font-semibold">{settings.heroTitle || settings.companyName}</h1>
              {settings.heroSubtitle && <p className="mt-6 max-w-xl text-lead text-paper/90">{settings.heroSubtitle}</p>}
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link href="/contact" className="btn-light">
                  Request a quote
                </Link>
                <Link href="/projects" className="link-arrow">
                  View our projects <ArrowRightIcon width={18} height={18} />
                </Link>
              </div>
            </div>
            {heroProject && (
              <Link href={`/projects/${heroProject.slug}`} className="text-small text-paper/80 hover:text-paper">
                {heroProject.title}
                {heroProject.location && <>, {heroProject.location}</>}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Services: rows hanging from one axis, each with its own photograph */}
      {services.length > 0 && (
        <section id="services" className="section-y">
          <div className="container-x grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:sticky lg:top-12 lg:col-span-4 lg:self-start">
              <h2 className="text-head font-semibold">What we build</h2>
              <p className="mt-5 max-w-sm">
                From the first drawing to the handover, one team runs design, permits and construction.
              </p>
              <Link href="/contact" className="link-arrow mt-8">
                Discuss your project <ArrowRightIcon width={18} height={18} />
              </Link>
            </Reveal>
            <div className="space-y-20 lg:col-span-8 lg:space-y-28">
              {/* Services with a photograph: one row each, photographs at deliberately unequal sizes */}
              {withPhoto.length > 0 && (
                <ul className="space-y-20 lg:space-y-28">
                  {withPhoto.map((s, i) => (
                    <li key={s.id}>
                      <Reveal className="grid gap-6 sm:grid-cols-8 sm:gap-10">
                        <div className="sm:col-span-5">
                          <h3 className="text-lead font-semibold">{s.title}</h3>
                          {s.description && <p className="mt-3 max-w-[38ch]">{s.description}</p>}
                        </div>
                        <div className="sm:col-span-3">
                          <div className={`overflow-hidden bg-sand ${SERVICE_SHAPES[i % SERVICE_SHAPES.length]}`}>
                            <Photo mediaBase={mediaBase} src={s.imageKey} alt={s.title} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 35vw, 100vw" />
                          </div>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              )}
              {/* Services without one: a compact two-column list, so no row leaves half the screen empty */}
              {withoutPhoto.length > 0 && (
                <Reveal className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
                  {withoutPhoto.map((s) => (
                    <div key={s.id}>
                      <h3 className="text-lead font-semibold">{s.title}</h3>
                      {s.description && <p className="mt-3 max-w-[38ch]">{s.description}</p>}
                    </div>
                  ))}
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Projects: a filmstrip of featured work */}
      {featured.length > 0 && (
        <section className="section-y bg-sand">
          <Reveal className="container-x mb-12 flex flex-wrap items-baseline gap-x-10 gap-y-4">
            <h2 className="text-head font-semibold">Featured projects</h2>
            <Link href="/projects" className="link-arrow">
              All projects <ArrowRightIcon width={18} height={18} />
            </Link>
          </Reveal>
          <ProjectStrip count={featured.length}>
            {featured.map((p) => (
              <article key={p.id} data-slide className="w-[82%] shrink-0 snap-center lg:w-[73%]">
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-ink sm:aspect-[16/9]">
                    <Photo
                      mediaBase={mediaBase}
                      src={p.coverKey}
                      alt={p.title}
                      sizes="(min-width: 1024px) 73vw, 82vw"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-6 grid gap-x-6 gap-y-1 sm:grid-cols-12">
                    <h3 className="font-semibold sm:col-span-5">
                      {p.title}
                      {p.category && <span className="font-normal text-muted"> · {p.category}</span>}
                    </h3>
                    <p className="text-muted sm:col-span-3">{p.location}</p>
                    <p className="text-muted sm:col-span-2">{p.year}</p>
                    <p className="link-arrow sm:col-span-2 sm:justify-self-end">
                      View <ArrowRightIcon width={18} height={18} />
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </ProjectStrip>
        </section>
      )}

      {/* About: wide photograph with a paragraph set into it, and the record in a navy tile */}
      <section id="about" className="section-y">
        <div className="container-x">
          <Reveal className="max-w-3xl">
            <h2 className="text-head font-semibold">{settings.aboutTitle || `About ${settings.companyName}`}</h2>
            {about[0] && <p className="mt-6 text-lead">{about[0]}</p>}
          </Reveal>

          <div className="mt-16 grid gap-4 lg:grid-cols-12">
            <Reveal className="relative lg:col-span-8">
              <div className="aspect-[4/3] overflow-hidden bg-ink sm:aspect-[16/10]">
                <Photo mediaBase={mediaBase} src={aboutPhoto} alt={`${settings.companyName} at work`} sizes="(min-width: 1024px) 66vw, 100vw" />
              </div>
              {about[1] && (
                <p className="bg-paper pt-6 sm:absolute sm:top-0 sm:right-0 sm:w-[340px] sm:p-7">{about[1]}</p>
              )}
            </Reveal>

            {settings.stats.length > 0 && (
              <Reveal className="flex flex-col justify-between gap-10 bg-ink p-8 text-paper lg:col-span-4 lg:p-10">
                <h3 className="text-lead font-semibold">Our record</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-10">
                  {settings.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="text-head font-semibold tabular-nums">
                        <Stat value={s.value} />
                      </dd>
                      <dd className="mt-1 text-small text-on-navy-muted">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial: a photograph of the work and the client's words, offset */}
      {quote && (
        <section className="section-y bg-sand">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <div className="aspect-[3/4] overflow-hidden bg-ink">
                <Photo mediaBase={mediaBase} src={quotePhoto} alt={`A ${settings.companyName} project`} sizes="(min-width: 1024px) 33vw, 100vw" />
              </div>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7 lg:pt-28">
              <h2 className="sr-only">What our clients say</h2>
              <figure>
                <blockquote className="text-lead leading-relaxed font-medium">“{quote.quote}”</blockquote>
                <figcaption className="mt-8">
                  <span className="font-semibold">{quote.name}</span>
                  {quote.role && <span className="text-muted">, {quote.role}</span>}
                </figcaption>
              </figure>
              {moreQuotes.length > 0 && (
                <div className="mt-16 grid gap-10 sm:grid-cols-2">
                  {moreQuotes.slice(0, 2).map((t) => (
                    <figure key={t.id}>
                      <blockquote>“{t.quote}”</blockquote>
                      <figcaption className="mt-4 text-small">
                        <span className="font-semibold">{t.name}</span>
                        {t.role && <span className="text-muted">, {t.role}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* Clients: a printed list of names on a white card, on the navy field */}
      {clients.length > 0 && (
        <section className="bg-ink pt-24 lg:pt-32">
          <Reveal className="mx-auto w-[92%] bg-paper px-7 pt-12 pb-16 text-center sm:w-[70%] sm:px-14 lg:w-[56%]">
            <h2 className="text-lead font-semibold">Trusted by</h2>
            {clients.some((c) => c.logoKey) ? (
              <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
                {clients.map((c) => {
                  const logo = mediaUrl(c.logoKey, mediaBase);
                  const body = logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt={c.name} loading="lazy" className="h-10 w-auto max-w-[140px] object-contain" />
                  ) : (
                    <span className="font-semibold">{c.name}</span>
                  );
                  return <li key={c.id}>{c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">{body}</a> : body}</li>;
                })}
              </ul>
            ) : (
              <p className="mt-8 text-lead leading-[1.8]">
                {clients.map((c, i) => (
                  <span key={c.id}>
                    <span className="whitespace-nowrap">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{c.name}</a>
                      ) : (
                        c.name
                      )}
                    </span>
                    {i < clients.length - 1 && <span className="text-muted">{"\u00a0· "}</span>}
                  </span>
                ))}
              </p>
            )}
          </Reveal>
        </section>
      )}

      {/* Visit card on a photograph */}
      <section id="contact" className="relative">
        <div className="h-[60svh] overflow-hidden bg-ink sm:h-[88svh]">
          <Photo mediaBase={mediaBase} src={contactPhoto} alt={`${settings.companyName} construction site`} sizes="100vw" />
        </div>
        <div className="container-x relative -mt-24 sm:absolute sm:inset-x-0 sm:top-14 sm:mt-0 sm:flex sm:justify-end">
          <Reveal className="w-full bg-paper p-8 sm:w-[400px]">
            <h2 className="text-head font-semibold">Talk to us</h2>
            <dl className="mt-6 space-y-4 text-[15px]">
              {settings.address && (
                <div>
                  <dt className="text-muted">Office</dt>
                  <dd>{settings.address}</dd>
                </div>
              )}
              {settings.workingHours && (
                <div>
                  <dt className="text-muted">Hours</dt>
                  <dd>{settings.workingHours}</dd>
                </div>
              )}
              {settings.phone && (
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd>
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:underline">{settings.phone}</a>
                  </dd>
                </div>
              )}
              {settings.email && (
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${settings.email}`} className="break-all hover:underline">{settings.email}</a>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-8 grid gap-2">
              <Link href="/contact" className="btn-primary">Request a free quote</Link>
              {wa && (
                <WhatsAppLink href={wa} className="btn-whatsapp">
                  <WhatsAppIcon width={18} height={18} /> Chat on WhatsApp
                </WhatsAppLink>
              )}
            </div>
          </Reveal>
        </div>
        <div className="h-16 sm:hidden" />
      </section>
    </>
  );
}

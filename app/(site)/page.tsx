import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, MailIcon, PhoneIcon, PinIcon, QuoteIcon, ServiceIcon, WhatsAppIcon } from "@/components/site/icons";
import { LeadForm } from "@/components/site/lead-form";
import { MediaImage } from "@/components/site/media-image";
import { ProjectCard } from "@/components/site/project-card";
import { WhatsAppLink } from "@/components/site/whatsapp";
import {
  getClients,
  getFeaturedProjects,
  getPublishedServices,
  getPublishedTestimonials,
  getSettings,
} from "@/lib/db/queries";
import { getMediaBase, getSiteUrl, getVar } from "@/lib/env";
import { paragraphs } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, services, featured, testimonials, clients, mediaBase, siteUrl, turnstileSiteKey] = await Promise.all([
    getSettings(),
    getPublishedServices(),
    getFeaturedProjects(),
    getPublishedTestimonials(),
    getClients(),
    getMediaBase(),
    getSiteUrl(),
    getVar("TURNSTILE_SITE_KEY"),
  ]);

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const heroKey = settings.heroImageKey ?? featured[0]?.coverKey ?? null;
  const heroUrl = mediaUrl(heroKey, mediaBase);
  const aboutImage = featured[1]?.coverKey ?? featured[0]?.coverKey ?? null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd(settings, siteUrl, mediaBase))} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroUrl} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover opacity-45" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="container-x py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            {settings.tagline && <p className="eyebrow text-brand">{settings.tagline}</p>}
            <h1 className="mt-4 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-6xl">
              {settings.heroTitle || settings.companyName}
            </h1>
            {settings.heroSubtitle && <p className="mt-6 max-w-xl text-lg text-white/80">{settings.heroSubtitle}</p>}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Get a free quote <ArrowRightIcon width={18} height={18} />
              </Link>
              <Link href="/projects" className="btn-outline">View our projects</Link>
              {wa && (
                <WhatsAppLink href={wa} className="btn-whatsapp">
                  <WhatsAppIcon width={18} height={18} /> WhatsApp
                </WhatsAppLink>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {settings.stats.length > 0 && (
        <section className="border-b border-line bg-white">
          <dl className="container-x grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
            {settings.stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl font-extrabold text-brand-dark sm:text-4xl">{s.value}</dd>
                <dd className="mt-1 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section id="services" className="py-20 sm:py-24">
          <div className="container-x">
            <div className="max-w-2xl">
              <p className="eyebrow">What we do</p>
              <h2 className="section-title">Our services</h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <div key={s.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
                  <div className="flex size-12 items-center justify-center rounded-md bg-brand-soft text-brand-dark">
                    <ServiceIcon name={s.icon} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  {s.description && <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured projects */}
      {featured.length > 0 && (
        <section className="bg-sand py-20 sm:py-24">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="eyebrow">Our work</p>
                <h2 className="section-title">Featured projects</h2>
              </div>
              <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline">
                All projects <ArrowRightIcon width={16} height={16} />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} mediaBase={mediaBase} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {(settings.aboutBody || settings.aboutTitle) && (
        <section id="about" className="py-20 sm:py-24">
          <div className="container-x grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Who we are</p>
              <h2 className="section-title">{settings.aboutTitle || `About ${settings.companyName}`}</h2>
              <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
                {paragraphs(settings.aboutBody).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Link href="/contact" className="btn-dark mt-8">Talk to our team</Link>
            </div>
            {aboutImage && (
              <MediaImage
                mediaBase={mediaBase}
                src={aboutImage}
                thumb={aboutImage.replace(/\.(\w+)$/, "-thumb.$1")}
                alt={`${settings.companyName} project`}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
              />
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-ink py-20 text-white sm:py-24">
          <div className="container-x">
            <p className="eyebrow text-brand">Testimonials</p>
            <h2 className="section-title">What our clients say</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="flex flex-col rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
                  <QuoteIcon className="text-brand" />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-white/85">{t.quote}</blockquote>
                  <figcaption className="mt-6 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    {t.role && <span className="text-white/60"> · {t.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clients */}
      {clients.length > 0 && (
        <section className="border-b border-line bg-white py-14">
          <div className="container-x">
            <p className="text-center text-sm font-medium text-muted">Trusted by</p>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {clients.map((c) => {
                const logo = mediaUrl(c.logoKey, mediaBase);
                const content = logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={c.name} loading="lazy" className="h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                ) : (
                  <span className="text-lg font-semibold text-muted">{c.name}</span>
                );
                return (
                  <li key={c.id}>
                    {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">{content}</a> : content}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Quote CTA */}
      <section id="quote" className="py-20 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="eyebrow">Start your project</p>
            <h2 className="section-title">Get a free quote</h2>
            <p className="mt-4 text-ink-soft">Tell us what you&apos;re planning and we&apos;ll get back to you within one business day.</p>
            <ul className="mt-8 space-y-4 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <PhoneIcon className="text-brand-dark" />
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="font-medium hover:underline">{settings.phone}</a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <MailIcon className="text-brand-dark" />
                  <a href={`mailto:${settings.email}`} className="font-medium break-all hover:underline">{settings.email}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-3">
                  <PinIcon className="shrink-0 text-brand-dark" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
            {wa && (
              <WhatsAppLink href={wa} className="btn-whatsapp mt-8">
                <WhatsAppIcon width={18} height={18} /> Chat on WhatsApp
              </WhatsAppLink>
            )}
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-line sm:p-8 lg:col-span-3">
            <LeadForm pageSource="/" services={services.map((s) => s.title)} turnstileSiteKey={turnstileSiteKey} />
          </div>
        </div>
      </section>
    </>
  );
}

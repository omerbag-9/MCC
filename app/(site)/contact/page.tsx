import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon, WhatsAppIcon } from "@/components/site/icons";
import { LeadForm } from "@/components/site/lead-form";
import { Photo, photoPool } from "@/components/site/photo";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { WhatsAppLink } from "@/components/site/whatsapp";
import { getContent, getFeaturedProjects, getPublishedServices, getSettings } from "@/lib/db/queries";
import { getMediaBase, getVar } from "@/lib/env";
import { whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Contact us",
    description: `Get in touch with ${settings.companyName}. Send a message, call, email or write to us on WhatsApp.`,
    alternates: { canonical: "/contact" },
  };
}

/** Only Google Maps embeds are allowed in the iframe. */
function safeMapUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)google\.[a-z.]+$/.test(u.hostname) && u.pathname.startsWith("/maps") ? u.toString() : null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const [settings, c, services, featured, mediaBase, turnstileSiteKey] = await Promise.all([
    getSettings(),
    getContent(),
    getPublishedServices(),
    getFeaturedProjects(),
    getMediaBase(),
    getVar("TURNSTILE_SITE_KEY"),
  ]);
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const map = safeMapUrl(settings.mapEmbedUrl);
  const photo = c.contactPageImage || photoPool(...featured.map((p) => p.coverKey), settings.heroImageKey).next();
  const recent = featured.slice(0, 3);

  const items = [
    settings.phone && { label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    settings.email && { label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.address && { label: "Office", value: settings.address },
    settings.workingHours && { label: "Working hours", value: settings.workingHours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <>
      <section className="grid lg:grid-cols-2">
        {/* Form half */}
        <div className="px-5 pt-14 pb-20 sm:px-8 lg:px-12 lg:pt-20 lg:pb-28">
          <Reveal className="lg:max-w-xl">
            <h1 className="text-display font-semibold">{c.contactPageTitle}</h1>
            <p className="mt-5 text-lead">
              {c.contactPageIntro}
            </p>
            <div className="mt-8 flex flex-wrap gap-2 lg:hidden">
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn-primary">
                  <PhoneIcon width={18} height={18} /> Call us
                </a>
              )}
              {wa && (
                <WhatsAppLink href={wa} className="btn-whatsapp">
                  <WhatsAppIcon width={18} height={18} /> WhatsApp
                </WhatsAppLink>
              )}
            </div>
            <div className="mt-12">
              <LeadForm pageSource="/contact" services={services.map((s) => s.title)} turnstileSiteKey={turnstileSiteKey} labels={{ button: c.formButton, successTitle: c.formSuccessTitle, successText: c.formSuccessText }} />
            </div>
          </Reveal>
        </div>

        {/* Photograph half, with the contact details set on it */}
        <div className="relative min-h-[560px] bg-ink lg:min-h-0">
          <div className="absolute inset-0">
            <Photo mediaBase={mediaBase} src={photo} alt={`${settings.companyName} at work`} sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
          <Reveal className="absolute inset-x-5 bottom-5 bg-ink p-8 text-paper sm:inset-x-8 sm:bottom-8 lg:inset-x-auto lg:right-12 lg:bottom-12 lg:w-[380px]">
            <h2 className="text-lead font-semibold">{c.contactDetailsTitle}</h2>
            {items.length > 0 && (
              <dl className="mt-6 space-y-5">
                {items.map(({ label, value, href }) => (
                  <div key={label}>
                    <dt className="text-small text-on-navy-muted">{label}</dt>
                    <dd className="mt-0.5">
                      {href ? (
                        <a href={href} className="font-semibold break-words hover:underline">{value}</a>
                      ) : (
                        <span className="font-semibold">{value}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {wa && (
              <WhatsAppLink href={wa} className="btn-whatsapp mt-8 w-full">
                <WhatsAppIcon width={18} height={18} /> Chat on WhatsApp
              </WhatsAppLink>
            )}
          </Reveal>
        </div>
      </section>

      {c.on("showContactRecent") && recent.length > 0 && (
        <section className="section-y bg-sand">
          <div className="container-x">
            <Reveal className="mb-12 flex flex-wrap items-baseline gap-x-10 gap-y-4">
              <h2 className="text-head font-semibold">{c.contactRecentTitle}</h2>
              <Link href="/projects" className="link-arrow">
                All projects <ArrowRightIcon width={18} height={18} />
              </Link>
            </Reveal>
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
              {recent.map((p) => (
                <Reveal key={p.id}>
                  <ProjectCard project={p} mediaBase={mediaBase} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {map && (
        <section aria-label="Map">
          <iframe
            src={map}
            title={`${settings.companyName} location`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[60svh] w-full border-0 grayscale"
            allowFullScreen
          />
        </section>
      )}
    </>
  );
}

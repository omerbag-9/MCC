import type { Metadata } from "next";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/site/icons";
import { LeadForm } from "@/components/site/lead-form";
import { WhatsAppLink } from "@/components/site/whatsapp";
import { getPublishedServices, getSettings } from "@/lib/db/queries";
import { getVar } from "@/lib/env";
import { whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Contact us",
    description: `Request a free quote from ${settings.companyName}. Call, email or message us on WhatsApp.`,
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
  const [settings, services, turnstileSiteKey] = await Promise.all([
    getSettings(),
    getPublishedServices(),
    getVar("TURNSTILE_SITE_KEY"),
  ]);
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const map = safeMapUrl(settings.mapEmbedUrl);

  const items = [
    settings.phone && { icon: PhoneIcon, label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    settings.email && { icon: MailIcon, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.address && { icon: PinIcon, label: "Office", value: settings.address },
    settings.workingHours && { icon: ClockIcon, label: "Working hours", value: settings.workingHours },
  ].filter(Boolean) as { icon: typeof PhoneIcon; label: string; value: string; href?: string }[];

  return (
    <>
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="container-x">
          <p className="eyebrow text-brand">Contact</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Let&apos;s build together</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Send us a few details about your project and we&apos;ll get back to you with a free quote.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-5">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-line sm:p-8 lg:col-span-3">
            <h2 className="text-xl font-bold">Request a quote</h2>
            <div className="mt-6">
              <LeadForm pageSource="/contact" services={services.map((s) => s.title)} turnstileSiteKey={turnstileSiteKey} />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {wa && (
              <WhatsAppLink href={wa} className="flex items-center gap-4 rounded-lg bg-[#1fa855] p-6 text-white transition hover:bg-[#178a45]">
                <WhatsAppIcon width={36} height={36} />
                <span>
                  <span className="block font-semibold">Chat on WhatsApp</span>
                  <span className="text-sm text-white/85">The fastest way to reach us</span>
                </span>
              </WhatsAppLink>
            )}
            {items.length > 0 && (
              <ul className="space-y-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
                {items.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-dark">
                      <Icon width={20} height={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium tracking-wide text-muted uppercase">{label}</span>
                      {href ? (
                        <a href={href} className="font-medium break-words hover:underline">{value}</a>
                      ) : (
                        <span className="font-medium">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {map && (
          <div className="container-x mt-10">
            <iframe
              src={map}
              title={`${settings.companyName} location`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full rounded-lg border-0 sm:h-96"
              allowFullScreen
            />
          </div>
        )}
      </section>
    </>
  );
}

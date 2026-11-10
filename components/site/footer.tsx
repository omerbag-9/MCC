import Link from "next/link";
import { Logo } from "./logo";
import type { Project, Service, Settings } from "@/lib/db/schema";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, SocialIcon } from "./icons";

const PAGES = [
  { href: "/#about", label: "About us" },
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Request a quote" },
];

export function Footer({
  settings,
  services,
  projects,
  quoteLabel = "Request a quote",
}: {
  settings: Settings;
  services: Service[];
  projects: Project[];
  quoteLabel?: string;
}) {
  const socials = (
    [
      ["facebook", settings.facebookUrl],
      ["instagram", settings.instagramUrl],
      ["linkedin", settings.linkedinUrl],
      ["youtube", settings.youtubeUrl],
      ["tiktok", settings.tiktokUrl],
    ] as const
  ).filter(([, url]) => url);

  return (
    <footer className="bg-sand text-ink">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-3">
          <Link href="/" className="inline-block" aria-label={`${settings.companyName}, home`}>
            <Logo height={96} tone="brand" alt={settings.companyName} className="h-20 w-auto lg:h-24" />
          </Link>
          {settings.tagline && <p className="mt-5 max-w-xs text-muted">{settings.tagline}</p>}
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={network}
                  className="flex size-10 items-center justify-center bg-paper text-ink transition-colors hover:bg-ink hover:text-ink"
                >
                  <SocialIcon network={network} width={18} height={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Footer" className="lg:col-span-2">
          <p className="font-semibold">Company</p>
          <ul className="mt-5 space-y-3 text-muted">
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="transition-colors hover:text-ink">{p.href === "/contact" ? quoteLabel : p.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {projects.length > 0 && (
          <nav aria-label="Projects" className="lg:col-span-2">
            <p className="font-semibold">Projects</p>
            <ul className="mt-5 space-y-3 text-muted">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.slug}`} className="transition-colors hover:text-ink">{p.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {services.length > 0 && (
          <div className="lg:col-span-2">
            <p className="font-semibold">Services</p>
            <ul className="mt-5 space-y-3 text-muted">
              {services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link href="/#services" className="transition-colors hover:text-ink">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="lg:col-span-3">
          <p className="font-semibold">Contact</p>
          <ul className="mt-5 space-y-3.5 text-muted">
            {settings.phone && (
              <li className="flex gap-3">
                <PhoneIcon width={18} height={18} className="mt-0.5 shrink-0 text-ink" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-ink">{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <MailIcon width={18} height={18} className="mt-0.5 shrink-0 text-ink" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-ink">{settings.email}</a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-3">
                <PinIcon width={18} height={18} className="mt-0.5 shrink-0 text-ink" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.workingHours && (
              <li className="flex gap-3">
                <ClockIcon width={18} height={18} className="mt-0.5 shrink-0 text-ink" />
                <span>{settings.workingHours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="bg-brand-dark">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-small text-on-navy-muted">
          <p>© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
          <Link href="/contact" className="hover:text-paper">{quoteLabel}</Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { Settings } from "@/lib/db/schema";
import { SocialIcon } from "./icons";
import { Photo } from "./photo";

const MENU = [
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/contact", label: "Request a quote" },
];

export function Footer({ settings, photo, mediaBase }: { settings: Settings; photo: string | null; mediaBase: string }) {
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
    <footer className="grid bg-ink text-paper lg:min-h-[640px] lg:grid-cols-2">
      <div className="relative h-[44svh] overflow-hidden lg:h-auto">
        <Photo mediaBase={mediaBase} src={photo} alt={`${settings.companyName} on site`} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0" />
      </div>

      <div className="flex flex-col px-5 pt-14 pb-8 sm:px-8 lg:px-16 lg:pt-20">
        <p className="text-body font-semibold">{settings.companyName}</p>

        <nav aria-label="Footer" className="mt-10">
          <ul className="space-y-3">
            {MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block text-head font-semibold tracking-tight transition-transform duration-200 hover:translate-x-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-14 grid gap-8 text-[15px] sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="font-semibold">Contact</p>
            {settings.phone && (
              <p><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-on-navy-muted hover:text-paper">{settings.phone}</a></p>
            )}
            {settings.email && (
              <p><a href={`mailto:${settings.email}`} className="break-all text-on-navy-muted hover:text-paper">{settings.email}</a></p>
            )}
            {settings.address && <p className="text-on-navy-muted">{settings.address}</p>}
          </div>
          {socials.length > 0 && (
            <div>
              <p className="font-semibold">Follow us</p>
              <div className="mt-3 flex gap-2">
                {socials.map(([network, url]) => (
                  <a
                    key={network}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={network}
                    className="flex size-10 items-center justify-center bg-navy-2 transition-colors hover:bg-paper hover:text-ink"
                  >
                    <SocialIcon network={network} width={18} height={18} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-auto pt-14 text-small text-on-navy-muted">
          © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

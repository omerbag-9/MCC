import Link from "next/link";
import type { Settings } from "@/lib/db/schema";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, SocialIcon } from "./icons";

export function Footer({ settings }: { settings: Settings }) {
  const socials = [
    ["facebook", settings.facebookUrl],
    ["instagram", settings.instagramUrl],
    ["linkedin", settings.linkedinUrl],
    ["youtube", settings.youtubeUrl],
    ["tiktok", settings.tiktokUrl],
  ].filter(([, url]) => url) as [string, string][];

  return (
    <footer className="bg-ink text-white/75">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-bold text-white">{settings.companyName}</p>
          {settings.tagline && <p className="mt-2 max-w-sm text-sm">{settings.tagline}</p>}
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-md bg-white/10 hover:bg-brand hover:text-white"
                  aria-label={network}
                >
                  <SocialIcon network={network} width={18} height={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/#services" className="hover:text-white">Services</Link></li>
            <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
            <li><Link href="/#about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.phone && (
              <li className="flex gap-2.5">
                <PhoneIcon width={18} height={18} className="shrink-0 text-brand" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-2.5">
                <MailIcon width={18} height={18} className="shrink-0 text-brand" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white">{settings.email}</a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-2.5">
                <PinIcon width={18} height={18} className="shrink-0 text-brand" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.workingHours && (
              <li className="flex gap-2.5">
                <ClockIcon width={18} height={18} className="shrink-0 text-brand" />
                <span>{settings.workingHours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-xs text-white/50">
          © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

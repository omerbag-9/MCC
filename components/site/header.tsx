import Link from "next/link";
import { Logo } from "./logo";
import type { Settings } from "@/lib/db/schema";
import { ClockIcon, CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon, SocialIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";

// Services lives on the home page: that link scrolls smoothly to its section (html has
// scroll-behavior: smooth). About, Projects, News and Contact have their own pages.
// In the order a visitor meets them on the home page: who we are, what we do, what we've built,
// what is new, how to reach us. The footer's Company list follows the same order.
const NAV = [
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

/** Desktop only: hours, address and email, and the social links, above the menu. Scrolls away. */
export function TopBar({ settings }: { settings: Settings }) {
  const socials = (
    [
      ["facebook", settings.facebookUrl],
      ["instagram", settings.instagramUrl],
      ["linkedin", settings.linkedinUrl],
      ["youtube", settings.youtubeUrl],
      ["tiktok", settings.tiktokUrl],
    ] as const
  ).filter(([, url]) => url);
  const items = [
    settings.workingHours && { icon: ClockIcon, text: settings.workingHours },
    settings.address && { icon: PinIcon, text: settings.address },
    settings.email && { icon: MailIcon, text: settings.email, href: `mailto:${settings.email}` },
  ].filter(Boolean) as { icon: typeof ClockIcon; text: string; href?: string }[];
  if (items.length === 0 && socials.length === 0) return null;
  return (
    <div className="hidden h-10 bg-brand-dark text-small text-on-navy-muted lg:block">
      <div className="container-x flex h-full items-center justify-between gap-8">
        <ul className="flex items-center gap-8">
          {items.map(({ icon: Icon, text, href }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon width={15} height={15} className="text-paper" />
              {href ? <a href={href} className="hover:text-paper">{text}</a> : text}
            </li>
          ))}
        </ul>
        {socials.length > 0 && (
          <ul className="flex items-center gap-1">
            {socials.map(([network, url]) => (
              <li key={network}>
                <a href={url} target="_blank" rel="noopener noreferrer" aria-label={network} className="flex size-8 items-center justify-center hover:text-paper">
                  <SocialIcon network={network} width={15} height={15} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Sticky dark navy bar on every page. */
export function Header({ companyName, phone }: { companyName: string; phone: string }) {
  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${companyName}, home`}>
          <Logo height={56} alt={companyName} className="h-12 w-auto lg:h-14" />
        </Link>

        <nav className="hidden items-center gap-1 text-[15px] font-medium lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 text-paper/80 transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-paper after:transition-transform after:duration-300 hover:text-paper hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {phone && (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="hidden items-center gap-2 text-[15px] text-paper/80 hover:text-paper lg:flex">
            <PhoneIcon width={17} height={17} />
            {phone}
          </a>
        )}

        <MobileMenu
          summary={
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[15px] font-medium lg:hidden [&::-webkit-details-marker]:hidden">
              <MenuIcon className="group-open:hidden" width={22} height={22} />
              <CloseIcon className="hidden group-open:block" width={22} height={22} />
              Menu
            </summary>
          }
        >
          <nav className="absolute inset-x-0 top-[72px] z-40 hidden bg-ink px-5 pt-2 pb-8 text-paper group-open:block" aria-label="Mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block py-3.5 text-lead font-medium">
                {item.label}
              </Link>
            ))}
          </nav>
        </MobileMenu>
      </div>
    </header>
  );
}

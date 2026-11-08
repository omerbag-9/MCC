import Link from "next/link";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ companyName, phone }: { companyName: string; phone: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded bg-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M3 21V10l9-6 9 6v11h-6v-7H9v7z" />
            </svg>
          </span>
          <span className="truncate">{companyName}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
              <PhoneIcon width={16} height={16} />
              {phone}
            </a>
          )}
          <Link href="/contact" className="btn-primary py-2">
            Get a quote
          </Link>
        </div>

        {/* Mobile menu: native <details>, closes when a link is tapped */}
        <MobileMenu
          summary={
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <MenuIcon className="group-open:hidden" />
              <CloseIcon className="hidden group-open:block" />
              <span className="sr-only">Menu</span>
            </summary>
          }
        >
          <nav
            className="absolute inset-x-0 top-16 border-b border-white/10 bg-ink px-4 pb-6 shadow-xl"
            aria-label="Mobile"
          >
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block border-b border-white/10 py-3.5 text-base">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="btn-primary mt-5 w-full">
              Get a quote
            </Link>
          </nav>
        </MobileMenu>
      </div>
    </header>
  );
}

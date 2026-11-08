import Link from "next/link";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";

// Services and About live on the home page: those links scroll smoothly to their sections
// (html has scroll-behavior: smooth). Projects and Contact have their own pages.
const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Sticky dark navy bar on every page. */
export function Header({ companyName, phone }: { companyName: string; phone: string }) {
  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-[17px] font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center bg-paper text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2 22V9l10-6 10 6v13h-7v-7H9v7z" />
            </svg>
          </span>
          <span className="truncate">{companyName}</span>
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

        <div className="hidden items-center gap-6 lg:flex">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-[15px] text-paper/80 hover:text-paper">
              <PhoneIcon width={17} height={17} />
              {phone}
            </a>
          )}
          <Link href="/contact" className="btn-light min-h-11 px-5">
            Request a quote
          </Link>
        </div>

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
            <Link href="/contact" className="btn-light mt-5 w-full">
              Request a quote
            </Link>
          </nav>
        </MobileMenu>
      </div>
    </header>
  );
}

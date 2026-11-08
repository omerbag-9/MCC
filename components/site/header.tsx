"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** On the home page the bar sits over the hero photograph; elsewhere it is a solid navy bar. */
export function Header({ companyName }: { companyName: string }) {
  const overlay = usePathname() === "/";
  return (
    <header className={`${overlay ? "absolute inset-x-0 top-0" : "relative bg-ink"} z-30 text-paper`}>
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-[17px] font-semibold tracking-tight">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M2 22V9l10-6 10 6v13h-7v-7H9v7z" />
          </svg>
          <span className="truncate">{companyName}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="opacity-85 transition-opacity hover:opacity-100">
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="btn-light min-h-10 px-5">
            Request a quote
          </Link>
        </nav>

        <MobileMenu
          summary={
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
              <MenuIcon className="group-open:hidden" width={22} height={22} />
              <CloseIcon className="hidden group-open:block" width={22} height={22} />
              Menu
            </summary>
          }
        >
          <nav className="absolute inset-x-0 top-20 z-40 hidden bg-ink px-5 pt-2 pb-8 text-paper group-open:block" aria-label="Mobile">
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

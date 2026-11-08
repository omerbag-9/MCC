import type { Metadata } from "next";
import Link from "next/link";
import { adminLogout } from "@/lib/actions/login";
import { ensureAdmin, isPasswordLoginEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await ensureAdmin();
  const passwordLogin = await isPasswordLoginEnabled();
  return (
    <div className="min-h-dvh bg-paper lg:flex">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between px-4 py-4 lg:px-5 lg:py-6">
          <Link href="/admin" className="font-bold">Website admin</Link>
          <Link href="/" target="_blank" className="text-xs text-white/60 hover:text-white lg:hidden">View site ↗</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 text-sm lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3" aria-label="Admin">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 rounded-md px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 px-5 py-4 text-xs text-white/60 lg:block">
          <p className="truncate">{admin.email}</p>
          <Link href="/" target="_blank" className="mt-2 inline-block hover:text-white">View site ↗</Link>
          {passwordLogin && (
            <form action={adminLogout} className="mt-2">
              <button className="hover:text-white">Sign out</button>
            </form>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
    </div>
  );
}

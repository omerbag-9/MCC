import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/site/logo";
import { count, eq } from "drizzle-orm";
import { AdminNav } from "@/components/admin/admin-nav";
import { Toaster } from "@/components/admin/toast";
import { adminLogout } from "@/lib/actions/login";
import { ensureAdmin, isPasswordLoginEnabled } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { clients, leads, newsPosts, projects, services } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await ensureAdmin();
  const db = await getDb();
  const [passwordLogin, [newLeads], [projectCount], [newsCount], [serviceCount], [clientCount]] = await Promise.all([
    isPasswordLoginEnabled(),
    db.select({ n: count() }).from(leads).where(eq(leads.status, "new")),
    db.select({ n: count() }).from(projects),
    db.select({ n: count() }).from(newsPosts),
    db.select({ n: count() }).from(services),
    db.select({ n: count() }).from(clients),
  ]);

  return (
    <div className="min-h-dvh bg-sand lg:flex">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between px-4 py-4 lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-3 font-semibold">
            <LogoMark size={30} />
            Website admin
          </Link>
          <Link href="/" target="_blank" className="text-xs text-white/60 hover:text-white lg:hidden">View site ↗</Link>
        </div>
        <AdminNav
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/leads", label: "Leads", count: newLeads.n, alert: true },
            { href: "/admin/projects", label: "Projects", count: projectCount.n },
            { href: "/admin/news", label: "News", count: newsCount.n },
            { href: "/admin/services", label: "Services", count: serviceCount.n },
            { href: "/admin/clients", label: "Clients", count: clientCount.n },
            { href: "/admin/content", label: "Website content" },
            { href: "/admin/settings", label: "Site settings" },
          ]}
        />
        <div className="hidden space-y-1 px-3 pb-5 text-sm lg:block">
          <Link href="/admin/projects/new" className="flex items-center gap-2 px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white">
            + New project
          </Link>
          <Link href="/admin/news/new" className="flex items-center gap-2 px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white">
            + New news post
          </Link>
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white">
            View site ↗
          </Link>
          {passwordLogin && (
            <form action={adminLogout}>
              <button className="w-full px-3 py-2.5 text-left text-white/80 hover:bg-white/10 hover:text-white">Sign out</button>
            </form>
          )}
          <p className="truncate px-3 pt-3 text-xs text-white/50">{admin.email}</p>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      <Toaster />
    </div>
  );
}

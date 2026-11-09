import Link from "next/link";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { Badge, Card, Flash, LEAD_STATUS_TONE, PageHeader } from "@/components/admin/ui";
import { refreshSite } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { leads, projects, settings, whatsappClicks } from "@/lib/db/schema";
import { getMediaBase } from "@/lib/env";
import { mediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/format";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const weekAgo = daysAgo(7);

  const [[newLeads], [weekLeads], [publishedProjects], [waWeek], topPages, recent, site, allProjects, serviceRows, mediaBase] = await Promise.all([
    db.select({ n: count() }).from(leads).where(eq(leads.status, "new")),
    db.select({ n: count() }).from(leads).where(gte(leads.createdAt, weekAgo)),
    db.select({ n: count() }).from(projects).where(eq(projects.published, true)),
    db.select({ n: count() }).from(whatsappClicks).where(gte(whatsappClicks.createdAt, weekAgo)),
    db
      .select({ page: whatsappClicks.pageSource, n: sql<number>`count(*)` })
      .from(whatsappClicks)
      .where(gte(whatsappClicks.createdAt, weekAgo))
      .groupBy(whatsappClicks.pageSource)
      .orderBy(desc(sql`count(*)`))
      .limit(5),
    db.query.leads.findMany({ orderBy: [desc(leads.createdAt)], limit: 6 }),
    db.query.settings.findFirst({ where: eq(settings.id, 1) }),
    db.query.projects.findMany({ columns: { id: true, title: true, coverKey: true, published: true, featured: true }, orderBy: (p, { asc }) => [asc(p.sortOrder), desc(p.id)] }),
    db.query.services.findMany({ columns: { id: true, title: true, published: true, imageKey: true }, orderBy: (s, { asc }) => [asc(s.sortOrder), asc(s.id)] }),
    getMediaBase(),
  ]);
  const drafts = allProjects.filter((p) => !p.published).length;
  const featured = allProjects.filter((p) => p.published && p.featured);
  const thumb = (key: string | null) => mediaUrl(key?.replace(/\.(\w+)$/, "-thumb.$1"), mediaBase);

  const stats = [
    { label: "New leads", value: newLeads.n, href: "/admin/leads?status=new" },
    { label: "Leads this week", value: weekLeads.n, href: "/admin/leads" },
    { label: "WhatsApp clicks (7 days)", value: waWeek.n },
    { label: "Published projects", value: publishedProjects.n, href: "/admin/projects" },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        action={
          <form action={refreshSite} className="flex flex-wrap gap-2">
            <Link href="/admin/projects/new" className="btn-primary py-2">+ New project</Link>
            <button className="btn border border-line bg-white py-2 text-ink hover:bg-sand" title="Re-render all public pages from the database">
              Refresh public site
            </button>
          </form>
        }
      />
      <p className="-mt-3 mb-6 text-muted">
        {newLeads.n > 0 ? `${newLeads.n} new lead${newLeads.n === 1 ? "" : "s"} waiting. ` : "No new leads. "}
        {publishedProjects.n} published project{publishedProjects.n === 1 ? "" : "s"}
        {drafts > 0 && `, ${drafts} draft${drafts === 1 ? "" : "s"}`}, {serviceRows.length} service{serviceRows.length === 1 ? "" : "s"}.
      </p>
      <Flash searchParams={await searchParams} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <Card className="h-full">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 text-3xl font-bold">{s.value}</p>
            </Card>
          );
          return s.href ? <Link key={s.label} href={s.href} className="block hover:opacity-90">{inner}</Link> : <div key={s.label}>{inner}</div>;
        })}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Home page</h2>
            <Link href="/admin/settings" className="text-sm font-medium hover:underline">Edit</Link>
          </div>
          <div className="mt-4 aspect-[16/9] overflow-hidden bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {(site?.heroImageKey || featured[0]?.coverKey) && <img src={thumb(site?.heroImageKey ?? featured[0]?.coverKey ?? null) ?? ""} alt="" className="size-full object-cover" />}
          </div>
          <p className="mt-3 font-medium">{site?.heroTitle || site?.companyName || "No hero title yet"}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{site?.heroSubtitle || "No subtitle yet."}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Projects</h2>
            <Link href="/admin/projects" className="text-sm font-medium hover:underline">Manage</Link>
          </div>
          <p className="mt-1 text-sm text-muted">{featured.length} featured on the home page</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {allProjects.slice(0, 6).map((p) => (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="group relative aspect-[4/3] overflow-hidden bg-sand" title={p.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.coverKey && <img src={thumb(p.coverKey) ?? ""} alt={p.title} className="size-full object-cover transition-transform group-hover:scale-105" />}
                {!p.published && <span className="absolute top-1 left-1 bg-white/90 px-1.5 text-[11px] font-medium">Draft</span>}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Services</h2>
            <Link href="/admin/services" className="text-sm font-medium hover:underline">Manage</Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {serviceRows.map((sv) => (
              <li key={sv.id} className="flex items-center gap-3">
                <span className="h-8 w-11 shrink-0 overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {sv.imageKey && <img src={thumb(sv.imageKey) ?? ""} alt="" className="size-full object-cover" />}
                </span>
                <span className="flex-1 truncate">{sv.title}</span>
                {!sv.published && <Badge>Hidden</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest leads</h2>
            <Link href="/admin/leads" className="text-sm text-brand-dark hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No leads yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{l.name}</span>
                      <span className="block truncate text-xs text-muted">{[l.phone, l.email, l.serviceInterest].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-xs text-muted sm:inline">{formatDate(l.createdAt)}</span>
                      <Badge tone={LEAD_STATUS_TONE[l.status]}>{l.status}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">Top WhatsApp pages (7 days)</h2>
          {topPages.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No clicks yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {topPages.map((p) => (
                <li key={p.page} className="flex justify-between gap-3">
                  <span className="truncate font-mono text-xs">{p.page}</span>
                  <span className="font-semibold">{p.n}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

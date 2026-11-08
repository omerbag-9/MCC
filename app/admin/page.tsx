import Link from "next/link";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { Badge, Card, Flash, LEAD_STATUS_TONE, PageHeader } from "@/components/admin/ui";
import { refreshSite } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { leads, projects, whatsappClicks } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const weekAgo = daysAgo(7);

  const [[newLeads], [weekLeads], [publishedProjects], [waWeek], topPages, recent] = await Promise.all([
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
  ]);

  const stats = [
    { label: "New leads", value: newLeads.n, href: "/admin/leads?status=new" },
    { label: "Leads this week", value: weekLeads.n, href: "/admin/leads" },
    { label: "WhatsApp clicks (7 days)", value: waWeek.n },
    { label: "Published projects", value: publishedProjects.n, href: "/admin/projects" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        action={
          <form action={refreshSite}>
            <button className="btn border border-line bg-white py-2 text-ink hover:bg-sand" title="Re-render all public pages from the database">
              Refresh public site
            </button>
          </form>
        }
      />
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

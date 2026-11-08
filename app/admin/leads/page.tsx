import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Badge, EmptyState, Flash, LEAD_STATUS_TONE, PageHeader } from "@/components/admin/ui";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { LEAD_STATUSES, leads, type LeadStatus } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Leads" };
const PAGE_SIZE = 50;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const params = await searchParams;
  const status = LEAD_STATUSES.includes(params.status as LeadStatus) ? (params.status as LeadStatus) : null;
  const page = Math.max(1, Number(params.page) || 1);
  const where = status ? eq(leads.status, status) : undefined;

  const db = await getDb();
  const [rows, [{ total }]] = await Promise.all([
    db.query.leads.findMany({ where, orderBy: [desc(leads.createdAt)], limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    db.select({ total: count() }).from(leads).where(where),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: Record<string, string | number | null>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(p)) if (v) s.set(k, String(v));
    const str = s.toString();
    return str ? `?${str}` : "";
  };

  return (
    <>
      <PageHeader
        title="Leads"
        action={<a href={`/admin/leads/export${qs({ status })}`} className="btn border border-line bg-white py-2 text-ink hover:bg-sand">Export CSV</a>}
      />
      <Flash searchParams={params} />

      <div className="mb-4 flex flex-wrap gap-2">
        {[null, ...LEAD_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={`/admin/leads${qs({ status: s })}`}
            className={`rounded-full px-3.5 py-1.5 text-sm capitalize ${status === s ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-ink/40"}`}
          >
            {s ?? "All"}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState>No leads{status ? ` with status “${status}”` : ""} yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-paper">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/leads/${l.id}`} className="hover:underline">{l.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <div>{l.phone}</div>
                    <div className="text-xs text-muted">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{l.serviceInterest || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{formatDate(l.createdAt)}</td>
                  <td className="px-4 py-3"><Badge tone={LEAD_STATUS_TONE[l.status]}>{l.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/leads${qs({ status, page: page - 1 })}`} className="btn border border-line bg-white py-1.5 text-ink">Previous</Link>}
            {page < pages && <Link href={`/admin/leads${qs({ status, page: page + 1 })}`} className="btn border border-line bg-white py-1.5 text-ink">Next</Link>}
          </div>
        </div>
      )}
    </>
  );
}

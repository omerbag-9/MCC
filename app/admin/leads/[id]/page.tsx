import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { BackLink, Card, Flash, PageHeader } from "@/components/admin/ui";
import { deleteLead, updateLead } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { LEAD_STATUSES, leads } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = { title: "Lead" };

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await ensureAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const db = await getDb();
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, id) });
  if (!lead) notFound();

  const wa = whatsappLink(lead.phone, `Hello ${lead.name}, thank you for contacting us.`);
  const rows: [string, React.ReactNode][] = [
    ["Phone", lead.phone ? <a href={`tel:${lead.phone}`} className="text-brand-dark hover:underline">{lead.phone}</a> : "—"],
    ["Email", lead.email ? <a href={`mailto:${lead.email}`} className="text-brand-dark hover:underline">{lead.email}</a> : "—"],
    ["Service", lead.serviceInterest || "—"],
    ["Submitted from", lead.pageSource || "—"],
    ["Received", formatDate(lead.createdAt)],
    ["Email notification", lead.emailSent ? "Sent" : "Not sent"],
  ];

  return (
    <>
      <BackLink href="/admin/leads">All leads</BackLink>
      <PageHeader title={lead.name} />
      <Flash searchParams={await searchParams} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-medium text-muted uppercase">{k}</dt>
                <dd className="mt-1 text-sm break-words">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-xs font-medium text-muted uppercase">Message</p>
            <p className="mt-2 text-sm whitespace-pre-wrap">{lead.message || "—"}</p>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6">Reply on WhatsApp</a>
          )}
        </Card>

        <Card>
          <form action={updateLead.bind(null, lead.id)} className="space-y-4">
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={lead.status} className="field capitalize">
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="label">Internal notes</label>
              <textarea id="notes" name="notes" rows={6} defaultValue={lead.notes} className="field" />
            </div>
            <button className="btn-primary w-full">Save</button>
          </form>
          <form action={deleteLead.bind(null, lead.id)} className="mt-6 border-t border-line pt-6">
            <ConfirmButton message="Delete this lead permanently?" className="btn w-full text-red-700 hover:bg-red-50">
              Delete lead
            </ConfirmButton>
          </form>
        </Card>
      </div>
    </>
  );
}

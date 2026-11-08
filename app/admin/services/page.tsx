import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, Checkbox, Flash, PageHeader } from "@/components/admin/ui";
import { ServiceIcon, SERVICE_ICONS } from "@/components/site/icons";
import { deleteService, saveService } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { services, type Service } from "@/lib/db/schema";

export const metadata = { title: "Services" };

function ServiceFields({ service }: { service?: Service }) {
  const prefix = service ? `s${service.id}-` : "new-";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}title`} className="label">Title *</label>
        <input id={`${prefix}title`} name="title" defaultValue={service?.title} required className="field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}description`} className="label">Description</label>
        <textarea id={`${prefix}description`} name="description" rows={3} defaultValue={service?.description} className="field" />
      </div>
      <fieldset>
        <legend className="label">Icon</legend>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SERVICE_ICONS).map((name) => (
            <label key={name} className="cursor-pointer" title={name}>
              <input type="radio" name="icon" value={name} defaultChecked={(service?.icon ?? "building") === name} className="peer sr-only" />
              <span className="flex size-10 items-center justify-center rounded-md bg-paper text-ink-soft ring-1 ring-line peer-checked:bg-brand-soft peer-checked:text-brand-dark peer-checked:ring-2 peer-checked:ring-brand peer-focus-visible:ring-2">
                <ServiceIcon name={name} width={20} height={20} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-4">
        <div>
          <label htmlFor={`${prefix}sortOrder`} className="label">Sort order</label>
          <input id={`${prefix}sortOrder`} name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} className="field" />
        </div>
        <Checkbox name="published" label="Published" defaultChecked={service?.published ?? true} />
      </div>
    </div>
  );
}

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const rows = await db.query.services.findMany({ orderBy: [asc(services.sortOrder), asc(services.id)] });

  return (
    <>
      <PageHeader title="Services" />
      <Flash searchParams={await searchParams} />

      <div className="space-y-3">
        {rows.map((s) => (
          <details key={s.id} className="group rounded-lg bg-white shadow-sm ring-1 ring-line">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="flex size-10 items-center justify-center rounded-md bg-brand-soft text-brand-dark">
                <ServiceIcon name={s.icon} width={20} height={20} />
              </span>
              <span className="flex-1 font-medium">{s.title}</span>
              {!s.published && <Badge>Hidden</Badge>}
              <span className="text-sm text-muted group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-line px-5 py-5">
              <form action={saveService.bind(null, s.id)} className="space-y-4">
                <ServiceFields service={s} />
                <button className="btn-primary py-2">Save</button>
              </form>
              <form action={deleteService.bind(null, s.id)} className="mt-3">
                <ConfirmButton message={`Delete “${s.title}”?`} className="btn px-0 py-1 text-red-700 hover:underline">Delete service</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 font-semibold">Add a service</h2>
        <form action={saveService.bind(null, null)} className="space-y-4">
          <ServiceFields />
          <button className="btn-primary py-2">Add service</button>
        </form>
      </Card>
    </>
  );
}

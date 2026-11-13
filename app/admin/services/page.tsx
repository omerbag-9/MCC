import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SortableList } from "@/components/admin/sortable-list";
import { ImageField } from "@/components/admin/image-field";
import { Badge, Card, Checkbox, Flash, PageHeader } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";
import { deleteService, saveService } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { services, type Service } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";

export const metadata = { title: "Services" };

function ServiceFields({ service, mediaBase, uploads }: { service?: Service; mediaBase: string; uploads: boolean }) {
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
      <div className="sm:col-span-2">
        <ImageField
          name="imageKey"
          label="Photo"
          path="site/services"
          nameFrom={["title"]}
          defaultKey={service?.imageKey ?? null}
          mediaBase={mediaBase}
          enabled={uploads}
          hint="Shown beside the service on the home page. A photo of this kind of work, landscape or portrait."
        />
      </div>
      <input type="hidden" name="icon" value={service?.icon ?? "building"} />
      <div />
      <div className="space-y-4">
        <Checkbox name="published" label="Published" defaultChecked={service?.published ?? true} />
      </div>
    </div>
  );
}

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [rows, mediaBase, bucket] = await Promise.all([
    db.query.services.findMany({ orderBy: [asc(services.sortOrder), asc(services.id)] }),
    getMediaBase(),
    getMediaBucket(),
  ]);
  const uploads = !!bucket;

  return (
    <>
      <PageHeader title="Services" />
      <Flash searchParams={await searchParams} />

      <SortableList
        kind="services"
        noun="Service order"
        items={rows.map((s) => ({
          id: s.id,
          label: s.title,
          node: (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.imageKey && <img src={mediaUrl(s.imageKey, mediaBase) ?? ""} alt="" className="size-full object-cover" />}
              </span>
              <span className="flex-1 font-medium">{s.title}</span>
              {!s.published && <Badge>Hidden</Badge>}
              <span className="text-sm text-muted group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-line px-5 py-5">
              <form action={saveService.bind(null, s.id)} className="space-y-4">
                <ServiceFields service={s} mediaBase={mediaBase} uploads={uploads} />
                <button className="btn-primary py-2">Save</button>
              </form>
              <form action={deleteService.bind(null, s.id)} className="mt-3">
                <ConfirmButton message={`Delete “${s.title}”?`} className="btn px-0 py-1 text-red-700 hover:underline">Delete service</ConfirmButton>
              </form>
            </div>
          </details>
          ),
        }))}
      />

      <Card className="mt-8">
        <h2 className="mb-4 font-semibold">Add a service</h2>
        <form action={saveService.bind(null, null)} className="space-y-4">
          <ServiceFields mediaBase={mediaBase} uploads={uploads} />
          <button className="btn-primary py-2">Add service</button>
        </form>
      </Card>
    </>
  );
}

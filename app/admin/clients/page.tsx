import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SortableList } from "@/components/admin/sortable-list";
import { ImageField } from "@/components/admin/image-field";
import { Card, Flash, PageHeader } from "@/components/admin/ui";
import { deleteClient, saveClient } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { clients, type Client } from "@/lib/db/schema";
import { getMediaBase, getMediaBucket } from "@/lib/env";
import { mediaUrl } from "@/lib/media";

export const metadata = { title: "Clients" };

function Fields({ c, mediaBase, uploads }: { c?: Client; mediaBase: string; uploads: boolean }) {
  const p = c ? `c${c.id}-` : "new-";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${p}name`} className="label">Name *</label>
        <input id={`${p}name`} name="name" defaultValue={c?.name} required className="field" />
      </div>
      <div>
        <label htmlFor={`${p}url`} className="label">Website</label>
        <input id={`${p}url`} name="url" type="url" defaultValue={c?.url} placeholder="https://" className="field" />
      </div>
      <div className="sm:col-span-2">
        <ImageField name="logoKey" label="Logo" path="clients" nameFrom={["name"]} fromProjects={false} defaultKey={c?.logoKey ?? null} mediaBase={mediaBase} enabled={uploads} hint="PNG with a transparent background works best." />
      </div>
    </div>
  );
}

export default async function ClientsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const [rows, mediaBase, bucket] = await Promise.all([
    db.query.clients.findMany({ orderBy: [asc(clients.sortOrder), asc(clients.id)] }),
    getMediaBase(),
    getMediaBucket(),
  ]);
  const uploads = !!bucket;

  return (
    <>
      <PageHeader title="Clients" />
      <p className="-mt-3 mb-6 text-sm text-muted">Logos shown in the “Trusted by” strip on the home page.</p>
      <Flash searchParams={await searchParams} />
      <SortableList
        kind="clients"
        noun="Client order"
        items={rows.map((c) => {
          const logo = mediaUrl(c.logoKey, mediaBase);
          return {
            id: c.id,
            label: c.name,
            node: (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="flex h-10 w-20 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {logo && <img src={logo} alt="" className="max-h-10 max-w-20 object-contain" />}
                </span>
                <span className="flex-1 font-medium">{c.name}</span>
                <span className="text-sm text-muted group-open:hidden">Edit</span>
              </summary>
              <div className="border-t border-line px-5 py-5">
                <form action={saveClient.bind(null, c.id)} className="space-y-4">
                  <Fields c={c} mediaBase={mediaBase} uploads={uploads} />
                  <button className="btn-primary py-2">Save</button>
                </form>
                <form action={deleteClient.bind(null, c.id)} className="mt-3">
                  <ConfirmButton message={`Delete “${c.name}”?`} className="btn px-0 py-1 text-red-700 hover:underline">Delete</ConfirmButton>
                </form>
              </div>
            </details>
          ),
          };
        })}
      />
      <Card className="mt-8">
        <h2 className="mb-4 font-semibold">Add a client</h2>
        <form action={saveClient.bind(null, null)} className="space-y-4">
          <Fields mediaBase={mediaBase} uploads={uploads} />
          <button className="btn-primary py-2">Add client</button>
        </form>
      </Card>
    </>
  );
}

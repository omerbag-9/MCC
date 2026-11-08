import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, Checkbox, Flash, PageHeader } from "@/components/admin/ui";
import { deleteTestimonial, saveTestimonial } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { testimonials, type Testimonial } from "@/lib/db/schema";

export const metadata = { title: "Testimonials" };

function Fields({ t }: { t?: Testimonial }) {
  const p = t ? `t${t.id}-` : "new-";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${p}name`} className="label">Name *</label>
        <input id={`${p}name`} name="name" defaultValue={t?.name} required className="field" />
      </div>
      <div>
        <label htmlFor={`${p}role`} className="label">Role / company</label>
        <input id={`${p}role`} name="role" defaultValue={t?.role} className="field" placeholder="e.g. Homeowner, New Cairo" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${p}quote`} className="label">Quote *</label>
        <textarea id={`${p}quote`} name="quote" rows={3} defaultValue={t?.quote} required className="field" />
      </div>
      <div>
        <label htmlFor={`${p}sortOrder`} className="label">Sort order</label>
        <input id={`${p}sortOrder`} name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} className="field" />
      </div>
      <div className="flex items-end pb-2">
        <Checkbox name="published" label="Published" defaultChecked={t?.published ?? true} />
      </div>
    </div>
  );
}

export default async function TestimonialsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  const db = await getDb();
  const rows = await db.query.testimonials.findMany({ orderBy: [asc(testimonials.sortOrder), asc(testimonials.id)] });

  return (
    <>
      <PageHeader title="Testimonials" />
      <Flash searchParams={await searchParams} />
      <div className="space-y-3">
        {rows.map((t) => (
          <details key={t.id} className="group rounded-lg bg-white shadow-sm ring-1 ring-line">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{t.name}</span>
                <span className="block truncate text-sm text-muted">{t.quote}</span>
              </span>
              {!t.published && <Badge>Hidden</Badge>}
              <span className="text-sm text-muted group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-line px-5 py-5">
              <form action={saveTestimonial.bind(null, t.id)} className="space-y-4">
                <Fields t={t} />
                <button className="btn-primary py-2">Save</button>
              </form>
              <form action={deleteTestimonial.bind(null, t.id)} className="mt-3">
                <ConfirmButton message="Delete this testimonial?" className="btn px-0 py-1 text-red-700 hover:underline">Delete</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </div>
      <Card className="mt-8">
        <h2 className="mb-4 font-semibold">Add a testimonial</h2>
        <form action={saveTestimonial.bind(null, null)} className="space-y-4">
          <Fields />
          <button className="btn-primary py-2">Add testimonial</button>
        </form>
      </Card>
    </>
  );
}

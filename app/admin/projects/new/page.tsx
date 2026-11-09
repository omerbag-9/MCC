import { ProjectFields } from "@/components/admin/project-form";
import { BackLink, Flash, PageHeader } from "@/components/admin/ui";
import { createProject } from "@/lib/actions/admin";
import { ensureAdmin } from "@/lib/auth";

export const metadata = { title: "New project" };

export default async function NewProject({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await ensureAdmin();
  return (
    <>
      <BackLink href="/admin/projects">All projects</BackLink>
      <PageHeader title="New project" />
      <Flash searchParams={await searchParams} />
      <p className="mb-6 text-sm text-muted">Create the project first; the next screen lets you add photos and videos.</p>
      <form action={createProject} className="max-w-3xl space-y-6">
        <ProjectFields />
        <button className="btn-primary">Create project</button>
      </form>
    </>
  );
}

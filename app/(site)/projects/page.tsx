import type { Metadata } from "next";
import { ProjectCard } from "@/components/site/project-card";
import { ProjectsBrowser } from "@/components/site/projects-browser";
import { Reveal } from "@/components/site/reveal";
import { getPublishedProjects, getSettings } from "@/lib/db/queries";
import { getMediaBase } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Projects",
    description: `Residential, commercial and industrial projects completed by ${settings.companyName}.`,
    alternates: { canonical: "/projects" },
  };
}

export default async function ProjectsPage() {
  const [projects, mediaBase] = await Promise.all([getPublishedProjects(), getMediaBase()]);

  return (
    <>
    <section className="bg-ink text-paper">
      <Reveal className="container-x grid gap-6 py-14 lg:grid-cols-12 lg:items-end lg:py-20">
        <h1 className="text-display font-semibold lg:col-span-6">Our projects</h1>
        <p className="max-w-xl text-lead text-on-navy-muted lg:col-span-6 lg:justify-self-end">
          Homes, offices, warehouses and renovations we have designed and built.
        </p>
      </Reveal>
    </section>
    <section className="section-y">
      <div className="container-x">
        {projects.length === 0 ? (
          <p className="text-muted">Projects will be published here soon.</p>
        ) : (
          <ProjectsBrowser
            items={projects.map((p) => ({
              id: p.id,
              category: p.category,
              node: <ProjectCard project={p} mediaBase={mediaBase} />,
            }))}
          />
        )}
      </div>
    </section>
    </>
  );
}

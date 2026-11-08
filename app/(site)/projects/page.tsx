import type { Metadata } from "next";
import { ProjectCard } from "@/components/site/project-card";
import { ProjectsBrowser } from "@/components/site/projects-browser";
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
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="container-x">
          <p className="eyebrow text-brand">Portfolio</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Our projects</h1>
          <p className="mt-4 max-w-2xl text-white/75">A selection of the work we&apos;re proud of.</p>
        </div>
      </section>
      <section className="py-14 sm:py-20">
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

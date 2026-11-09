import type { Metadata } from "next";
import { formatArea, ProjectCard } from "@/components/site/project-card";
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

  // The record, computed from the published projects themselves.
  const area = projects.reduce((sum, p) => sum + (p.areaM2 ?? 0), 0);
  const years = projects.map((p) => p.year).filter((y): y is number => !!y);
  const sectors = new Set(projects.map((p) => p.category).filter(Boolean)).size;
  const record = [
    { value: String(projects.length), label: projects.length === 1 ? "Project" : "Projects" },
    area > 0 && { value: formatArea(area)!, label: "Built area" },
    sectors > 1 && { value: String(sectors), label: "Sectors" },
    years.length > 1 && Math.min(...years) !== Math.max(...years) && { value: `${Math.min(...years)}–${Math.max(...years)}`, label: "Delivered" },
  ].filter((r): r is { value: string; label: string } => !!r);

  return (
    <>
      <section className="bg-ink text-paper">
        <div className="container-x grid gap-10 py-14 lg:grid-cols-12 lg:items-end lg:py-20">
          <Reveal className="lg:col-span-6">
            <h1 className="text-display font-semibold">Our projects</h1>
            <p className="mt-5 max-w-xl text-lead text-on-navy-muted">
              Homes, offices, warehouses and renovations we have designed and built.
            </p>
          </Reveal>
          {projects.length > 0 && (
            <Reveal className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:col-span-6" stagger={0.06}>
              {record.map((r) => (
                <dl key={r.label} className="bg-navy-2 px-5 py-5">
                  <dt className="sr-only">{r.label}</dt>
                  <dd className="text-lead font-semibold whitespace-nowrap tabular-nums">{r.value}</dd>
                  <dd className="mt-1 text-small text-on-navy-muted">{r.label}</dd>
                </dl>
              ))}
            </Reveal>
          )}
        </div>
      </section>
      <section className="pt-6 pb-16 lg:pb-24">
        <div className="container-x">
          {projects.length === 0 ? (
            <p className="py-16 text-muted">Projects will be published here soon.</p>
          ) : (
            <ProjectsBrowser
              items={projects.map((p, order) => ({
                id: p.id,
                category: p.category,
                text: [p.title, p.location, p.client, p.category, p.summary].join(" ").toLowerCase(),
                year: p.year,
                area: p.areaM2,
                order,
                node: <ProjectCard project={p} mediaBase={mediaBase} />,
              }))}
            />
          )}
        </div>
      </section>
    </>
  );
}

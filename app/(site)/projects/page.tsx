import type { Metadata } from "next";
import Link from "next/link";
import { Photo, photoPool } from "@/components/site/photo";
import { formatArea, ProjectTile } from "@/components/site/project-card";
import { ProjectsBrowser } from "@/components/site/projects-browser";
import { Reveal } from "@/components/site/reveal";
import { getContent, getPublishedProjects, getSettings } from "@/lib/db/queries";
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
  const [projects, settings, c, mediaBase] = await Promise.all([getPublishedProjects(), getSettings(), getContent(), getMediaBase()]);

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
  const heroPhoto = c.projectsImage || photoPool(...projects.map((p) => p.coverKey), settings.heroImageKey).next();

  return (
    <>
      {/* Header: a photograph of the work under a veil, the title, and the record along its foot */}
      <section className="relative isolate flex min-h-[420px] flex-col overflow-hidden bg-ink text-paper lg:min-h-[min(620px,calc(78svh-96px))]">
        <div className="absolute inset-0 -z-20">
          <Photo mediaBase={mediaBase} src={heroPhoto} alt="" sizes="100vw" priority className="hero-photo" />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink/70" />
        <Reveal className="container-x flex flex-1 flex-col justify-center py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-small text-on-navy-muted">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-paper">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-paper">Projects</li>
            </ol>
          </nav>
          <h1 className="mt-5 text-display font-semibold">{c.projectsTitle}</h1>
          <p className="mt-5 max-w-xl text-lead text-paper/90">
            {c.projectsIntro}
          </p>
        </Reveal>
        {record.length > 0 && projects.length > 0 && (
          <div className="bg-ink">
            <Reveal className="container-x grid grid-cols-2 gap-y-6 py-6 sm:grid-cols-4 lg:py-8" stagger={0.06} onLoad delay={0.3}>
              {record.map((r) => (
                <dl key={r.label}>
                  <dt className="sr-only">{r.label}</dt>
                  <dd className="text-lead font-semibold whitespace-nowrap tabular-nums lg:text-head">{r.value}</dd>
                  <dd className="mt-1 text-small text-on-navy-muted">{r.label}</dd>
                </dl>
              ))}
            </Reveal>
          </div>
        )}
      </section>

      <section className="pt-6 pb-16 lg:pb-24">
        <div className="container-x">
          {projects.length === 0 ? (
            <p className="py-16 text-muted">{c.projectsEmpty}</p>
          ) : (
            <ProjectsBrowser
              items={projects.map((p, order) => ({
                id: p.id,
                category: p.category,
                text: [p.title, p.location, p.client, p.category, p.summary].join(" ").toLowerCase(),
                year: p.year,
                area: p.areaM2,
                order,
                node: <ProjectTile project={p} mediaBase={mediaBase} priority={order < 2} />,
              }))}
            />
          )}
        </div>
      </section>

    </>
  );
}

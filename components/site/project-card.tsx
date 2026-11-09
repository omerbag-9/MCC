import Link from "next/link";
import type { Project } from "@/lib/db/schema";
import { ArrowRightIcon } from "./icons";
import { Photo } from "./photo";

export const formatArea = (m2: number | null) => (m2 ? `${m2.toLocaleString("en-US")} m²` : null);

export function ProjectCard({ project, mediaBase, tall = false }: { project: Project; mediaBase: string; tall?: boolean }) {
  const facts = [project.location, project.year, formatArea(project.areaM2)].filter(Boolean);
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div data-card-media className={`relative overflow-hidden bg-ink ${tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
        <Photo
          mediaBase={mediaBase}
          src={project.coverKey}
          alt={project.title}
          sizes="(min-width: 1024px) 45vw, (min-width: 768px) 50vw, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {project.category && (
          <span className="absolute top-0 left-0 bg-ink px-3.5 py-2 text-small font-medium text-paper">{project.category}</span>
        )}
      </div>
      <h3 className="mt-5 text-lead font-semibold transition-colors group-hover:text-ink-soft">{project.title}</h3>
      {facts.length > 0 && (
        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-muted">
          {facts.map((f) => (
            <span key={String(f)}>{f}</span>
          ))}
        </p>
      )}
      {project.summary && <p className="mt-3 max-w-[52ch]">{project.summary}</p>}
      <p className="link-arrow mt-4">
        View project <ArrowRightIcon width={18} height={18} className="transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </Link>
  );
}

/**
 * A large picture card for the projects page: the photograph fills it, the category sits in the
 * top corner, and the title with its facts sits on an ink panel along the bottom edge.
 */
export function ProjectTile({ project, mediaBase, priority }: { project: Project; mediaBase: string; priority?: boolean }) {
  const facts = [project.location, project.year, formatArea(project.areaM2)].filter(Boolean);
  return (
    <Link href={`/projects/${project.slug}`} className="group relative block overflow-hidden bg-ink text-paper">
      <div data-card-media className="aspect-[4/3]">
        <Photo
          mediaBase={mediaBase}
          src={project.coverKey}
          alt={project.title}
          priority={priority}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
      </div>
      {project.category && (
        <span className="absolute top-0 left-0 bg-paper px-4 py-2 text-small font-semibold text-ink">{project.category}</span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 sm:right-auto sm:max-w-[88%]">
        <div className="min-w-0 bg-ink px-5 py-4 sm:px-7 sm:py-5">
          <h3 className="text-lead font-semibold">{project.title}</h3>
          {facts.length > 0 && (
            <p className="mt-1 flex flex-wrap gap-x-4 text-small text-on-navy-muted">
              {facts.map((f) => (
                <span key={String(f)}>{f}</span>
              ))}
            </p>
          )}
        </div>
      </div>
      <span
        aria-hidden
        className="absolute right-0 bottom-0 hidden size-14 items-center justify-center bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0 sm:flex sm:translate-x-full"
      >
        <ArrowRightIcon width={22} height={22} />
      </span>
    </Link>
  );
}

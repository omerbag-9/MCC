import Link from "next/link";
import type { Project } from "@/lib/db/schema";
import { MediaImage } from "./media-image";

export function ProjectCard({ project, mediaBase }: { project: Project; mediaBase: string }) {
  const meta = [project.location, project.year].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <MediaImage
          mediaBase={mediaBase}
          src={project.coverKey}
          thumb={project.coverKey ? project.coverKey.replace(/\.(\w+)$/, "-thumb.$1") : null}
          alt={project.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {project.category && (
          <span className="absolute top-3 left-3 rounded bg-ink/80 px-2.5 py-1 text-xs font-medium text-white">
            {project.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-balance group-hover:text-brand-dark">{project.title}</h3>
        {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
        {project.summary && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{project.summary}</p>}
      </div>
    </Link>
  );
}

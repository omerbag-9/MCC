import Link from "next/link";
import type { Project } from "@/lib/db/schema";
import { ArrowRightIcon } from "./icons";
import { Photo } from "./photo";

export function ProjectCard({ project, mediaBase, tall = false }: { project: Project; mediaBase: string; tall?: boolean }) {
  const meta = [project.category, project.location, project.year].filter(Boolean).join(" · ");
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div data-card-media className={`overflow-hidden bg-ink ${tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
        <Photo
          mediaBase={mediaBase}
          src={project.coverKey}
          alt={project.title}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-5 text-lead font-semibold">{project.title}</h3>
      {meta && <p className="mt-1 text-muted">{meta}</p>}
      {project.summary && <p className="mt-3 max-w-[52ch]">{project.summary}</p>}
      <p className="link-arrow mt-4">
        View project <ArrowRightIcon width={18} height={18} />
      </p>
    </Link>
  );
}

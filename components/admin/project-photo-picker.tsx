"use client";

import { useRef, useState } from "react";
import { listProjectPhotos, type ProjectPhotos } from "@/lib/actions/admin";

/**
 * "Choose from projects": a dialog with every project's photos, grouped by project. Picking one
 * calls onPick with its key, so a section can reuse a project photo instead of a new upload.
 */
export function ProjectPhotoPicker({ onPick, current }: { onPick: (key: string) => void; current: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [projects, setProjects] = useState<ProjectPhotos[] | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    dialog.current?.showModal();
    if (projects) return;
    try {
      const list = await listProjectPhotos();
      setProjects(list);
      // Start on the project the current photo belongs to, if any.
      setProjectId((list.find((p) => p.photos.some((ph) => ph.key === current)) ?? list[0])?.id ?? null);
    } catch {
      setError("Could not load the project photos.");
    }
  }

  const project = projects?.find((p) => p.id === projectId);

  return (
    <>
      <button type="button" onClick={open} className="btn border border-line bg-white py-2 text-ink hover:bg-sand">
        Choose from projects
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(64rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60"
      >
        <div className="flex max-h-[calc(100vh-2rem)] flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <h2 className="mr-auto text-lg font-semibold">Choose a project photo</h2>
            {projects && projects.length > 0 && (
              <select
                value={projectId ?? ""}
                onChange={(e) => setProjectId(Number(e.target.value))}
                className="field w-auto py-2"
                aria-label="Project"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.photos.length})
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => dialog.current?.close()} className="btn border border-line bg-white py-2 hover:bg-sand">
              Close
            </button>
          </div>
          <div className="overflow-y-auto p-4">
            {error && <p className="text-sm text-red-700">{error}</p>}
            {!projects && !error && <p className="text-sm text-muted">Loading photos…</p>}
            {projects?.length === 0 && <p className="text-sm text-muted">No project has photos yet.</p>}
            {project && project.photos.length === 0 && <p className="text-sm text-muted">This project has no photos yet.</p>}
            {project && project.photos.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {project.photos.map((ph) => (
                  <li key={ph.key}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(ph.key);
                        dialog.current?.close();
                      }}
                      className={`relative block aspect-[4/3] w-full overflow-hidden bg-sand ring-1 hover:ring-2 hover:ring-ink ${ph.key === current ? "ring-2 ring-ink" : "ring-line"}`}
                      aria-label={`Use ${ph.alt || `photo ${ph.n}`} of ${project.title}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ph.thumb} alt="" loading="lazy" className="size-full object-cover" />
                      {ph.key === current && <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-xs font-semibold text-paper">In use</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

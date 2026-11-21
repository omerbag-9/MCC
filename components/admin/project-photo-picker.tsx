"use client";

import { useRef, useState } from "react";
import { listProjectPhotos, type ProjectPhotos } from "@/lib/actions/admin";

/**
 * "Choose from projects": a dialog with every project's photos, grouped by project. Picking one
 * calls onPick with its key, so a section can reuse a project photo instead of a new upload.
 *
 * With onPickMany, several photos (from any of the projects) are ticked and added together;
 * `current` then lists the photos already in use, which are marked and can't be ticked again.
 */
export function ProjectPhotoPicker({
  onPick,
  onPickMany,
  current,
  max = Infinity,
  label = "Choose from projects",
}: {
  onPick?: (key: string) => void;
  onPickMany?: (keys: string[]) => void;
  current: string | string[];
  /** With onPickMany: how many photos can still be added. */
  max?: number;
  label?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [projects, setProjects] = useState<ProjectPhotos[] | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ticked, setTicked] = useState<string[]>([]);
  const many = !!onPickMany;
  const inUse = new Set(Array.isArray(current) ? current : current ? [current] : []);

  function pick(key: string) {
    if (!many) {
      onPick?.(key);
      dialog.current?.close();
      return;
    }
    if (inUse.has(key)) return;
    setTicked((t) => (t.includes(key) ? t.filter((k) => k !== key) : t.length < max ? [...t, key] : t));
  }

  async function open() {
    setTicked([]);
    dialog.current?.showModal();
    if (projects) return;
    try {
      const list = await listProjectPhotos();
      setProjects(list);
      // Start on the project the current photo belongs to, if any.
      setProjectId((list.find((p) => p.photos.some((ph) => inUse.has(ph.key))) ?? list.find((p) => p.photos.length > 0) ?? list[0])?.id ?? null);
    } catch {
      setError("Could not load the project photos.");
    }
  }

  const project = projects?.find((p) => p.id === projectId);

  return (
    <>
      <button type="button" onClick={open} disabled={max <= 0} className="btn border border-line bg-white py-2 text-ink hover:bg-sand disabled:opacity-50">
        {label}
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(64rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60"
      >
        <div className="flex max-h-[calc(100vh-2rem)] flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <h2 className="mr-auto text-lg font-semibold">{many ? "Choose project photos" : "Choose a project photo"}</h2>
            {projects && projects.length > 0 && (
              <select
                value={projectId ?? ""}
                onChange={(e) => setProjectId(Number(e.target.value))}
                className="field w-auto py-2"
                aria-label="Project"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.photos.length}
                    {many && p.photos.some((ph) => ticked.includes(ph.key)) ? `, ${p.photos.filter((ph) => ticked.includes(ph.key)).length} ticked` : ""})
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => dialog.current?.close()} className="btn border border-line bg-white py-2 hover:bg-sand">
              {many ? "Cancel" : "Close"}
            </button>
            {many && (
              <button
                type="button"
                disabled={ticked.length === 0}
                onClick={() => {
                  onPickMany?.(ticked);
                  dialog.current?.close();
                }}
                className="btn bg-ink py-2 text-paper hover:bg-ink-soft disabled:opacity-50"
              >
                {ticked.length === 0 ? "Add photos" : `Add ${ticked.length} photo${ticked.length === 1 ? "" : "s"}`}
              </button>
            )}
          </div>
          <div className="overflow-y-auto p-4">
            {error && <p className="text-sm text-red-700">{error}</p>}
            {!projects && !error && <p className="text-sm text-muted">Loading photos…</p>}
            {projects?.length === 0 && <p className="text-sm text-muted">No project has photos yet.</p>}
            {project && project.photos.length === 0 && <p className="text-sm text-muted">This project has no photos yet.</p>}
            {many && (
              <p className="mb-3 text-sm text-muted">
                Tick the photos to add, from one project or several.{" "}
                {Number.isFinite(max) && `Room for ${max - ticked.length} more.`}
              </p>
            )}
            {project && project.photos.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {project.photos.map((ph) => {
                  const used = inUse.has(ph.key);
                  const on = ticked.includes(ph.key);
                  const name = `${ph.alt || `photo ${ph.n}`} of ${project.title}`;
                  return (
                    <li key={ph.key}>
                      <button
                        type="button"
                        onClick={() => pick(ph.key)}
                        disabled={many && used}
                        aria-pressed={many ? on : undefined}
                        className={`relative block aspect-[4/3] w-full overflow-hidden bg-sand ring-1 hover:ring-2 hover:ring-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:ring-1 ${used || on ? "ring-2 ring-ink" : "ring-line"}`}
                        aria-label={many ? (used ? `${name}, already in the slideshow` : `Tick ${name}`) : `Use ${name}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ph.thumb} alt="" loading="lazy" className="size-full object-cover" />
                        {used && <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-xs font-semibold text-paper">In use</span>}
                        {on && (
                          <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
                            {ticked.indexOf(ph.key) + 1}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

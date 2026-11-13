"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addProjectMedia, deleteMedia, reorderMedia, setCover, setSectionPhoto, updateMediaAlt, type PhotoSection } from "@/lib/actions/admin";
import { uploadMedia } from "@/lib/client/upload";
import { toast } from "./toast";

export type ManagedMedia = { id: number; key: string; type: "image" | "video"; src: string; thumb: string; alt: string };
type Upload = { key: string; name: string; preview: string | null; progress: number; failed?: string };

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm";

/** The photo slots of a project page, in page order. "cover" is the top banner (and the card photo). */
export type Slot = "cover" | PhotoSection;
const SLOTS: { slot: Slot; label: string; badge: string }[] = [
  { slot: "cover", label: "Top banner (cover)", badge: "Cover" },
  { slot: "story", label: "\u201cAbout the project\u201d section", badge: "About" },
  { slot: "overview", label: "\u201cProject overview\u201d section", badge: "Overview" },
];

function Tile({
  m,
  slots,
  onSlot,
  onClearSlot,
  onDelete,
  onAlt,
}: {
  m: ManagedMedia;
  /** The page sections this photo is chosen for. */
  slots: Slot[];
  onSlot: (slot: Slot) => void;
  onClearSlot: (slot: PhotoSection) => void;
  onDelete: () => void;
  onAlt: (alt: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(m.alt);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative bg-white ring-1 ring-line ${isDragging ? "opacity-30" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="relative aspect-[4/3] cursor-grab touch-none overflow-hidden bg-sand active:cursor-grabbing"
        aria-label={`${m.alt || "Photo"}. Press space to pick up, arrow keys to move.`}
      >
        {m.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.thumb} alt="" draggable={false} className="size-full object-cover" />
        ) : (
          <video src={m.src} muted preload="metadata" className="size-full object-cover" />
        )}
        {slots.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {SLOTS.filter((s) => slots.includes(s.slot)).map((s) => (
              <span key={s.slot} className="flex items-center bg-ink text-xs font-semibold text-paper">
                <span className="px-2 py-1">{s.badge}</span>
                {s.slot !== "cover" && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onClearSlot(s.slot as PhotoSection)}
                    className="border-l border-paper/20 px-1.5 py-1 hover:bg-ink-soft"
                    title={`Stop using this photo for ${s.label}; the section picks a photo automatically`}
                    aria-label={`Remove from ${s.label}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
        {m.type === "video" && <span className="absolute top-2 right-2 bg-ink/80 px-2 py-1 text-xs text-paper">Video</span>}
      </div>
      <div className="space-y-1 p-2">
        {editing ? (
          <form
            className="flex gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              onAlt(alt);
              setEditing(false);
            }}
          >
            <input autoFocus value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the photo" className="field min-w-0 flex-1 py-1.5 text-sm" aria-label="Caption" />
            <button className="btn min-h-8 bg-ink px-3 text-xs text-paper">Save</button>
          </form>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="block w-full truncate px-1 py-1 text-left text-sm text-muted hover:text-ink" title={m.alt || "Add a caption"}>
            {m.alt || "+ Add a caption"}
          </button>
        )}
        <div className="flex justify-end gap-1">
          {m.type === "image" && slots.length < SLOTS.length && (
            <select
              value=""
              onChange={(e) => e.target.value && onSlot(e.target.value as Slot)}
              className="min-w-0 flex-1 cursor-pointer bg-transparent px-1 py-1 text-xs font-semibold text-ink hover:bg-sand"
              aria-label="Use this photo for a section of the project page"
            >
              <option value="">Use for…</option>
              {SLOTS.filter((s) => !slots.includes(s.slot)).map((s) => (
                <option key={s.slot} value={s.slot}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <button type="button" onClick={onDelete} className="px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

/**
 * Photos and videos of one project. Drop files to upload them (one at a time, with progress),
 * drag to reorder (saved at once), set the cover, edit captions, delete with a 5-second undo.
 */
export function PhotoManager({
  projectId,
  projectSlug,
  coverKey,
  storyKey,
  overviewKey,
  media,
  uploadsEnabled,
}: {
  projectId: number;
  /** Uploads go to projects/<slug>/photos and /videos in the bucket. */
  projectSlug: string;
  coverKey: string | null;
  /** Photos chosen for the "About the project" and "Project overview" sections (null: automatic). */
  storyKey: string | null;
  overviewKey: string | null;
  media: ManagedMedia[];
  uploadsEnabled: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(media);
  const [prevMedia, setPrevMedia] = useState(media);
  if (media !== prevMedia) {
    setPrevMedia(media);
    setItems(media);
  }
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [over, setOver] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const pendingDeletes = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Deletions waiting for their undo window still happen if the editor is left.
  useEffect(() => {
    const pending = pendingDeletes.current;
    return () => {
      for (const [id, timer] of pending) {
        clearTimeout(timer);
        void deleteMedia(id, projectId);
      }
    };
  }, [projectId]);

  const onDragEnd = async ({ active, over: target }: DragEndEvent) => {
    setActiveId(null);
    if (!target || active.id === target.id) return;
    const prev = items;
    const next = arrayMove(prev, prev.findIndex((m) => m.id === active.id), prev.findIndex((m) => m.id === target.id));
    setItems(next);
    const result = await reorderMedia(projectId, next.map((m) => m.id)).catch(() => null);
    if (result?.ok) toast("Order saved");
    else {
      setItems(prev);
      toast("Could not save the order. Try again.");
    }
  };

  const remove = (m: ManagedMedia) => {
    setItems((list) => list.filter((x) => x.id !== m.id));
    const timer = setTimeout(async () => {
      pendingDeletes.current.delete(m.id);
      const result = await deleteMedia(m.id, projectId).catch(() => null);
      if (!result?.ok) toast("Could not delete the file");
      router.refresh();
    }, 5000);
    pendingDeletes.current.set(m.id, timer);
    toast(m.type === "video" ? "Video deleted" : "Photo deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          clearTimeout(timer);
          pendingDeletes.current.delete(m.id);
          setItems((list) => (list.some((x) => x.id === m.id) ? list : [...list, m].sort((a, b) => media.findIndex((x) => x.id === a.id) - media.findIndex((x) => x.id === b.id))));
        },
      },
    });
  };

  const upload = async (files: File[]) => {
    const accepted = files.filter((f) => ACCEPT.split(",").includes(f.type));
    if (accepted.length < files.length) toast("Some files were skipped: use JPG, PNG, WebP, MP4 or WebM");
    if (accepted.length === 0) return;
    const queue = accepted.map((f, i) => ({
      key: `${Date.now()}-${i}`,
      name: f.name,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      progress: 0,
    }));
    setUploads((u) => [...u, ...queue]);
    let done = 0;
    for (const [i, file] of accepted.entries()) {
      const key = queue[i].key;
      try {
        const item = await uploadMedia(file, `projects/${projectSlug}`, (f) =>
          setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress: f } : x))),
        );
        const result = await addProjectMedia(projectId, [item]);
        if (!result.ok) throw new Error(result.error);
        done++;
        setUploads((u) => u.filter((x) => x.key !== key));
        router.refresh();
      } catch (e) {
        setUploads((u) => u.map((x) => (x.key === key ? { ...x, failed: e instanceof Error ? e.message : "Upload failed" } : x)));
      }
    }
    queue.forEach((q) => q.preview && URL.revokeObjectURL(q.preview));
    if (done) toast(`${done} file${done > 1 ? "s" : ""} uploaded`);
  };

  const active = items.find((m) => m.id === activeId);

  return (
    <div className="space-y-4">
      {uploadsEnabled ? (
        <div
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) {
              e.preventDefault();
              setOver(true);
            }
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void upload(Array.from(e.dataTransfer.files));
          }}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-8 text-center transition-colors ${over ? "border-ink bg-brand-soft" : "border-line bg-white"}`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="text-muted">
            <path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" />
          </svg>
          <p className="font-medium">
            Drop photos or videos here, or{" "}
            <button type="button" className="font-semibold underline underline-offset-4" onClick={() => input.current?.click()}>
              choose files
            </button>
          </p>
          <p className="text-xs text-muted">Photos are resized and compressed automatically. Videos: MP4 or WebM, under 100 MB.</p>
          <input
            ref={input}
            type="file"
            multiple
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              void upload(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <p className="bg-sand px-4 py-3 text-sm text-ink-soft">Uploads are turned off in this environment (it has no R2 storage).</p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(Number(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items.map((m) => m.id)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((m) => (
              <Tile
                key={m.id}
                m={m}
                slots={([["cover", coverKey], ["story", storyKey], ["overview", overviewKey]] as [Slot, string | null][])
                  .filter(([, k]) => k === m.key)
                  .map(([s]) => s)}
                onSlot={async (slot) => {
                  const r = await (slot === "cover" ? setCover(m.id, projectId) : setSectionPhoto(slot, m.id, projectId)).catch(() => null);
                  const label = SLOTS.find((s) => s.slot === slot)!.label;
                  toast(r?.ok ? `Photo set for the ${label}` : (r && !r.ok && r.error) || "Could not set the photo");
                  router.refresh();
                }}
                onClearSlot={async (slot) => {
                  const r = await setSectionPhoto(slot, null, projectId).catch(() => null);
                  toast(r?.ok ? "The section now picks a photo automatically" : "Could not update the section");
                  router.refresh();
                }}
                onDelete={() => remove(m)}
                onAlt={async (alt) => {
                  setItems((list) => list.map((x) => (x.id === m.id ? { ...x, alt } : x)));
                  const r = await updateMediaAlt(m.id, projectId, alt).catch(() => null);
                  toast(r?.ok ? "Caption saved" : "Could not save the caption");
                }}
              />
            ))}
            {uploads.map((u) => (
              <li key={u.key} className="relative bg-white ring-1 ring-line">
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {u.preview && <img src={u.preview} alt="" className="size-full object-cover opacity-50" />}
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-line">
                    <div className="h-full bg-ink transition-[width]" style={{ width: `${Math.round(u.progress * 100)}%` }} />
                  </div>
                </div>
                <p className={`truncate p-2 text-sm ${u.failed ? "text-red-700" : "text-muted"}`} title={u.failed}>
                  {u.failed ? `Failed: ${u.failed}` : `Uploading ${Math.round(u.progress * 100)}%`}
                </p>
              </li>
            ))}
          </ul>
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(.16,1,.3,1)" }}>
          {active && (
            <div className="aspect-[4/3] overflow-hidden bg-sand shadow-2xl shadow-ink/30 ring-2 ring-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {active.type === "image" ? <img src={active.thumb} alt="" className="size-full object-cover" /> : <video src={active.src} muted className="size-full object-cover" />}
            </div>
          )}
        </DragOverlay>
      </DndContext>
      {items.length === 0 && uploads.length === 0 && <p className="text-sm text-muted">No photos yet.</p>}
      {items.some((m) => m.type === "image") && (
        <p className="text-xs text-muted">
          Use <strong>Use for…</strong> on a photo to choose the top banner (cover), the &ldquo;About the project&rdquo; photo and the &ldquo;Project overview&rdquo; photo of the project page. A section without a chosen photo uses the next photos after the cover, in gallery order.
        </p>
      )}
      {items.length > 1 && (
        <p className="text-xs text-muted">
          Drag photos to reorder, or focus one, press <kbd className="bg-sand px-1">Space</kbd>, move with the arrow keys and press Space again. The order saves at once.
        </p>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorder, type Reorderable } from "@/lib/actions/admin";
import { toast } from "./toast";

export type SortableItem = { id: number; label: string; node: React.ReactNode };

export function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {[5, 12, 19].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
    </svg>
  );
}

function Row({ item }: { item: SortableItem }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex items-stretch bg-white ${isDragging ? "z-10 shadow-xl shadow-ink/15 ring-2 ring-ink" : ""}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="flex w-10 shrink-0 cursor-grab touch-none items-center justify-center text-muted hover:bg-sand hover:text-ink active:cursor-grabbing"
        aria-label={`Reorder ${item.label}. Press space to pick up, arrow keys to move.`}
      >
        <GripIcon />
      </button>
      <div className="min-w-0 flex-1">{item.node}</div>
    </li>
  );
}

/** Drag-and-drop ordering (mouse, touch and keyboard). The new order saves at once. */
export function SortableList({ kind, items: initial, noun = "Order" }: { kind: Reorderable; items: SortableItem[]; noun?: string }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const prev = items;
    const next = arrayMove(prev, prev.findIndex((i) => i.id === active.id), prev.findIndex((i) => i.id === over.id));
    setItems(next);
    try {
      const result = await reorder(kind, next.map((i) => i.id));
      if (!result.ok) throw new Error(result.error);
      toast(`${noun} saved`);
      router.refresh();
    } catch {
      setItems(prev);
      toast("Could not save the order. Try again.");
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-line overflow-hidden bg-white ring-1 ring-line">
          {items.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

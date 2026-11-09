"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; action?: { label: string; onClick: () => void }; duration: number };

let nextId = 1;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function emit() {
  for (const l of listeners) l(toasts);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** Shows a short message at the bottom of the admin. Optional action, e.g. "Undo". */
export function toast(message: string, opts: { action?: Toast["action"]; duration?: number } = {}) {
  const t: Toast = { id: nextId++, message, action: opts.action, duration: opts.duration ?? (opts.action ? 5000 : 3000) };
  toasts = [...toasts.slice(-2), t];
  emit();
  setTimeout(() => dismiss(t.id), t.duration);
  return t.id;
}

export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      {list.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex min-h-12 items-center gap-4 bg-ink px-5 py-3 text-[15px] text-paper shadow-lg shadow-black/20 motion-safe:animate-[toast-in_200ms_ease-out]"
        >
          <span>{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="font-semibold underline underline-offset-4 hover:no-underline"
              onClick={() => {
                t.action?.onClick();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

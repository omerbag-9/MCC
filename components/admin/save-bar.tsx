"use client";

import { useEffect } from "react";

/** Rises from the bottom while a form differs from what is saved; warns before leaving the page. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  label = "Save changes",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  label?: string;
}) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  const on = dirty || saving;
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      inert={!on}
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out lg:left-64 ${on ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 bg-ink px-5 py-3 text-paper shadow-2xl shadow-black/30 sm:mb-5">
        <span className="mr-auto flex items-center gap-2.5 text-[15px]">
          <i className="size-2 rounded-full bg-amber-400" aria-hidden />
          Unsaved changes
        </span>
        <button type="button" className="btn min-h-10 px-4 text-paper hover:bg-navy-2" onClick={onDiscard} disabled={saving}>
          Discard
        </button>
        <button type="button" className="btn-light min-h-10 px-5" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : label}
        </button>
      </div>
    </div>
  );
}

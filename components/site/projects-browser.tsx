"use client";

import { useState, type ReactNode } from "react";

/**
 * Category filter that runs in the browser, so /projects stays a single cached page
 * (no query-string variants to render or index).
 */
export function ProjectsBrowser({
  items,
}: {
  items: { id: number; category: string; node: ReactNode }[];
}) {
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort();
  const [active, setActive] = useState<string>("");
  const visible = active ? items.filter((i) => i.category === active) : items;

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["", ...categories].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active === c ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line hover:ring-ink/40"
              }`}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((i) => (
          <div key={i.id}>{i.node}</div>
        ))}
      </div>
    </>
  );
}

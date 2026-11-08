"use client";

import { useState, type ReactNode } from "react";
import FadeContent from "@/components/reactbits/FadeContent";

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
        <FadeContent className="mb-14 flex flex-wrap gap-2" role="group" aria-label="Filter by category" duration={0.7}>
          {["", ...categories].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={`min-h-11 px-5 text-[15px] font-medium transition-colors ${
                active === c ? "bg-ink text-paper" : "bg-sand text-ink hover:bg-brand-soft"
              }`}
            >
              {c || "All"}
            </button>
          ))}
        </FadeContent>
      )}
      {/* The first project runs across both columns and gets a wider crop. */}
      <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 md:[&>*:first-child]:col-span-2 md:[&>*:first-child_[data-card-media]]:aspect-[16/7]">
        {visible.map((i) => (
          <FadeContent key={`${active}-${i.id}`} duration={0.7} threshold={0.1}>
            {i.node}
          </FadeContent>
        ))}
      </div>
    </>
  );
}

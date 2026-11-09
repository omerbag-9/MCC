"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import FadeContent from "@/components/reactbits/FadeContent";
import { CloseIcon, SearchIcon } from "./icons";

export type BrowserItem = {
  id: number;
  category: string;
  /** Lower-cased title, location, client and summary, for the search box. */
  text: string;
  year: number | null;
  area: number | null;
  order: number;
  node: ReactNode;
};

const SORTS = {
  featured: { label: "Recommended", by: (a: BrowserItem, b: BrowserItem) => a.order - b.order },
  newest: { label: "Newest first", by: (a: BrowserItem, b: BrowserItem) => (b.year ?? 0) - (a.year ?? 0) || a.order - b.order },
  oldest: { label: "Oldest first", by: (a: BrowserItem, b: BrowserItem) => (a.year ?? 9999) - (b.year ?? 9999) || a.order - b.order },
  largest: { label: "Largest area", by: (a: BrowserItem, b: BrowserItem) => (b.area ?? 0) - (a.area ?? 0) || a.order - b.order },
} as const;
type SortKey = keyof typeof SORTS;

/** Column span (and wider crop) for the first card, so the rows of a 2- and 3-column grid fill. */
function leadClass(count: number) {
  const md = count % 2 === 1 && count > 1 ? "md:col-span-2 md:[&_[data-card-media]]:aspect-[16/9]" : "";
  const lg =
    count % 3 === 1 && count > 1
      ? "lg:col-span-3 lg:[&_[data-card-media]]:aspect-[21/9]"
      : count % 3 === 2
        ? "lg:col-span-2 lg:[&_[data-card-media]]:aspect-[16/9]"
        : "lg:col-span-1 lg:[&_[data-card-media]]:aspect-[4/3]";
  return `${md} ${lg}`;
}

/**
 * Category, search and sort, all in the browser, so /projects stays one cached page. The category
 * is mirrored in the address (?category=) so a filtered list can be shared; the server ignores it.
 */
export function ProjectsBrowser({ items }: { items: BrowserItem[] }) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) if (i.category) counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
    return [...counts].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    // Read once after hydration: the server renders the unfiltered list (one cached page).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c && categories.some(([name]) => name === c)) setActive(c);
  }, [categories]);

  const choose = (c: string) => {
    setActive(c);
    const url = new URL(window.location.href);
    if (c) url.searchParams.set("category", c);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  };

  const q = query.trim().toLowerCase();
  const visible = items
    .filter((i) => (!active || i.category === active) && (!q || i.text.includes(q)))
    .sort(SORTS[sort].by);
  const filtered = !!active || !!q;
  const reset = () => {
    choose("");
    setQuery("");
  };

  return (
    <>
      <div className="z-30 -mx-5 mb-12 bg-paper lg:sticky lg:top-[72px] px-5 py-4 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by category">
              {[["", items.length] as const, ...categories].map(([c, n]) => (
                <button
                  key={c || "all"}
                  type="button"
                  onClick={() => choose(c)}
                  aria-pressed={active === c}
                  className={`flex min-h-11 items-center gap-2.5 px-4 text-[15px] font-medium transition-colors ${
                    active === c ? "bg-ink text-paper" : "bg-sand text-ink hover:bg-brand-soft"
                  }`}
                >
                  {c || "All projects"}
                  <span className={`tabular-nums ${active === c ? "text-on-navy-muted" : "text-muted"}`}>{n}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <label className="relative basis-full sm:basis-auto sm:flex-1 lg:w-72 lg:flex-none">
              <span className="sr-only">Search projects</span>
              <SearchIcon width={18} height={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, place or client"
                className="min-h-11 w-full bg-sand pr-3 pl-10 text-[15px] placeholder:text-muted focus:bg-brand-soft focus:outline-none"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Sort projects</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-11 cursor-pointer appearance-none bg-sand pr-9 pl-4 text-[15px] font-medium hover:bg-brand-soft focus:outline-none"
              >
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" width="16" height="16" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </label>
          </div>
        </div>
        <p className="mt-3 flex min-h-6 items-center gap-3 text-small text-muted" aria-live="polite">
          {visible.length === items.length ? `${items.length} projects` : `${visible.length} of ${items.length} projects`}
          {filtered && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-medium text-ink hover:underline">
              <CloseIcon width={14} height={14} /> Clear filters
            </button>
          )}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-sand px-8 py-16 text-center">
          <p className="text-lead font-semibold">No projects match {q ? `“${query.trim()}”` : "this filter"}.</p>
          <p className="mt-2 text-muted">Try another word or category.</p>
          <button type="button" onClick={reset} className="btn-primary mt-6">
            Show all projects
          </button>
        </div>
      ) : (
        /* The first project is widened just enough that every row comes out full. */
        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((i, n) => (
            <FadeContent key={`${active}-${sort}-${i.id}`} duration={0.6} threshold={0.05} className={n === 0 ? leadClass(visible.length) : undefined}>
              {i.node}
            </FadeContent>
          ))}
        </div>
      )}
    </>
  );
}

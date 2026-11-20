"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

export type PageTab = { id: string; title: string; content: ReactNode };

/**
 * One tab per website page. Every panel stays in the form (hidden ones too), so one Save keeps
 * the edits made on several tabs. The open tab is kept in the address (?page=…) so a reload or a
 * link from another admin page lands on it.
 */
export function PageTabs({ tabs, initial }: { tabs: PageTab[]; initial: string }) {
  const [active, setActive] = useState(tabs.some((t) => t.id === initial) ? initial : tabs[0]?.id);

  const open = (id: string, focus = false) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("page", id);
    url.hash = "";
    window.history.replaceState(null, "", url);
    if (focus) document.getElementById(`tab-${id}`)?.focus();
    window.scrollTo({ top: 0 });
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    open(tabs[(i + d + tabs.length) % tabs.length].id, true);
  };

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-6 bg-sand px-4 pt-2 pb-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div role="tablist" aria-label="Website pages" className="flex gap-1 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={t.id === active}
              aria-controls={`panel-${t.id}`}
              tabIndex={t.id === active ? 0 : -1}
              onClick={() => open(t.id)}
              onKeyDown={onKey}
              className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                t.id === active ? "bg-ink text-white" : "text-muted hover:bg-sand hover:text-ink"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={t.id !== active}>
          {t.content}
        </div>
      ))}
    </div>
  );
}

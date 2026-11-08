"use client";

import { useState } from "react";
import { DrawnSite } from "./drawn-site";

export type ServiceItem = { id: number; title: string; description: string; src: string | null; thumb: string | null };

/**
 * Services on the navy field: the list on the left, the selected service's photograph and
 * description on the right. Hover or click changes the selection; on phones it is an accordion.
 */
export function ServicesExplorer({ items }: { items: ServiceItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <ul className="lg:col-span-5" role="tablist" aria-orientation="vertical">
        {items.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`service-panel-${s.id}`}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`group flex w-full items-center justify-between gap-6 py-4 text-left transition-colors duration-300 lg:py-5 ${on ? "text-paper" : "text-on-navy-muted hover:text-paper"}`}
              >
                <span className="text-lead font-semibold">{s.title}</span>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                  className={`shrink-0 transition-transform duration-300 ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              {/* Phone: the selected item opens underneath */}
              <div className={`grid transition-[grid-template-rows] duration-300 lg:hidden ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="pb-6">
                    {s.description && <p className="text-on-navy-muted">{s.description}</p>}
                    <div className="mt-5 aspect-[16/10] overflow-hidden bg-navy-2">
                      {s.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.thumb ?? s.src} alt={s.title} loading="lazy" className="size-full object-cover" />
                      ) : (
                        <DrawnSite className="size-full" label={s.title} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: one large picture with the description set on a navy panel */}
      <div className="relative hidden lg:col-span-7 lg:block">
        <div className="relative aspect-[4/3] overflow-hidden bg-navy-2">
          {items.map((s, i) => (
            <div
              key={s.id}
              id={`service-panel-${s.id}`}
              role="tabpanel"
              aria-hidden={i !== active}
              className={`absolute inset-0 transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
            >
              {s.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.src} alt={s.title} loading="lazy" className={`size-full object-cover transition-transform duration-[1200ms] ease-out ${i === active ? "scale-100" : "scale-105"}`} />
              ) : (
                <DrawnSite className="size-full" label={s.title} />
              )}
            </div>
          ))}
        </div>
        {current?.description && (
          <p key={current.id} className="absolute bottom-0 left-0 max-w-md bg-ink p-7 text-paper">
            {current.description}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRightIcon } from "./icons";

export type FactsItem = {
  id: number;
  title: string;
  slug: string;
  rows: [string, string][];
  photo: ReactNode;
};

/**
 * One tab per featured project; each shows the project's facts as a table beside its photograph.
 * Arrow keys move between tabs. Without script the first project is shown.
 */
export function ProjectFacts({ items }: { items: FactsItem[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + items.length) % items.length;
    setActive(next);
    document.getElementById(`${base}-tab-${next}`)?.focus();
  };
  const item = items[active];

  return (
    <div>
      <div role="tablist" aria-label="Projects" className="flex flex-wrap gap-1">
        {items.map((p, i) => (
          <button
            key={p.id}
            id={`${base}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${base}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
            className={`min-h-12 px-5 text-[15px] font-semibold transition-colors ${
              i === active ? "bg-paper text-ink" : "bg-navy-2 text-on-navy-muted hover:text-paper"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div
        key={item.id}
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${active}`}
        className="grid animate-[toast-in_.45s_ease-out] gap-1 bg-navy-2 p-1 lg:grid-cols-2"
      >
        <div className="bg-ink p-6 sm:p-8">
          <table className="w-full text-left">
            <caption className="sr-only">Facts about {item.title}</caption>
            <tbody>
              {item.rows.map(([k, v], i) => (
                <tr key={`${k}-${i}`} className={i % 2 === 0 ? "bg-navy-2" : ""}>
                  <th scope="row" className="w-2/5 px-4 py-3 align-top font-normal text-on-navy-muted">{k || "—"}</th>
                  <td className="px-4 py-3 font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href={`/projects/${item.slug}`} className="link-arrow mt-8">
            View {item.title} <ArrowRightIcon width={18} height={18} />
          </Link>
        </div>
        <div className="relative min-h-72 overflow-hidden bg-ink">
          <div className="absolute inset-0">{item.photo}</div>
        </div>
      </div>
    </div>
  );
}

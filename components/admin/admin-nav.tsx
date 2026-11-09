"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; count?: number; alert?: boolean };

/** Sidebar links with the current page marked and a count (or an alert badge) per section. */
export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-2 pb-3 text-sm lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3" aria-label="Admin">
      {items.map((item) => {
        const current = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 px-3 py-2.5 transition-colors ${current ? "bg-paper text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
          >
            <span className="flex-1">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span
                className={`min-w-6 px-1.5 text-center text-xs font-semibold tabular-nums ${item.alert ? "bg-amber-400 text-ink" : current ? "text-muted" : "text-white/50"}`}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

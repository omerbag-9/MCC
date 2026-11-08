"use client";

import { useRef } from "react";

/** Native <details> menu that closes itself when a link inside it is clicked. */
export function MobileMenu({ children, summary }: { children: React.ReactNode; summary: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={ref}
      className="group md:hidden"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a") && ref.current) ref.current.open = false;
      }}
    >
      {summary}
      {children}
    </details>
  );
}

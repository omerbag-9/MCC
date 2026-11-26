"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * What a visitor sees when a page fails to load. `dark` fills the screen in navy (used where the
 * site's header and footer aren't available); otherwise it sits between them on white.
 */
export function ErrorView({ error, retry, dark = false }: { error: unknown; retry: () => void; dark?: boolean }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error ? String(error.digest ?? "") : "";

  return (
    <section
      className={
        dark
          ? "flex min-h-dvh flex-col items-center justify-center bg-ink px-5 text-center text-paper"
          : "container-x flex min-h-[60svh] flex-col items-center justify-center py-20 text-center"
      }
    >
      <h1 className="text-display font-semibold">Something went wrong</h1>
      <p className={`mt-4 max-w-lg ${dark ? "text-on-navy-muted" : "text-muted"}`}>
        This page didn&apos;t load properly. Please try again in a moment. If it keeps happening, call or email us.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className={dark ? "btn-light" : "btn-primary"}>
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go home
        </Link>
      </div>
      {digest && <p className={`mt-8 text-small ${dark ? "text-on-navy-muted" : "text-muted"}`}>Reference: {digest}</p>}
    </section>
  );
}

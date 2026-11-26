"use client";

import "@fontsource-variable/hanken-grotesk";
import "./globals.css";
import { ErrorView } from "@/components/site/error-view";

/** The root layout itself failed. Replaces it, so it brings its own <html>, <body> and styles. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <ErrorView error={error} retry={retry} dark />
      </body>
    </html>
  );
}

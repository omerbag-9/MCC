"use client";

import { ErrorView } from "@/components/site/error-view";

/** Anything outside the public pages' own boundary failed (including the site's layout or the admin). */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} dark />;
}

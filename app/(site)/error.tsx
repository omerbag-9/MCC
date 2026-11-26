"use client";

import { ErrorView } from "@/components/site/error-view";

/** A page of the public site failed: shown between the site's header and footer. */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} />;
}

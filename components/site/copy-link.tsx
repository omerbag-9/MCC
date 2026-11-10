"use client";

import { useState } from "react";
import { CopyIcon } from "./icons";

/** Copies the page's address, and says so for two seconds. */
export function CopyLink({ url, className = "" }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this link:", url);
        }
      }}
    >
      <CopyIcon width={18} height={18} />
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}

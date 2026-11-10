"use client";

import { useState } from "react";
import { CheckCircleIcon, CopyIcon, SocialIcon } from "@/components/site/icons";
import { linkedinShareUrl } from "@/lib/news";
import { toast } from "./toast";

/**
 * Share a published news post on LinkedIn: copy a ready-made caption, then open LinkedIn's share
 * dialog, which shows the post's photo, headline and summary as a preview card.
 */
export function LinkedInShare({ url, caption, highlight }: { url: string; caption: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      toast("Caption copied. Paste it into the LinkedIn post.");
    } catch {
      toast("Could not copy. Select the text and copy it yourself.");
    }
  };

  return (
    <div className={`rounded-lg bg-white p-5 shadow-sm sm:p-6 ${highlight ? "ring-2 ring-[#0a66c2]" : "ring-1 ring-line"}`}>
      <div className="flex items-start gap-3">
        <SocialIcon network="linkedin" width={26} height={26} className="mt-0.5 shrink-0 text-[#0a66c2]" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{highlight ? "Published. Now share it on LinkedIn" : "Share on LinkedIn"}</h2>
          <p className="mt-1 text-sm text-muted">
            1. Copy the caption. 2. Open LinkedIn, paste it, choose to post as the company page if you manage one, and press Post.
            The website link is added as a preview card with the photo.
          </p>
        </div>
      </div>
      <textarea readOnly value={caption} rows={5} className="field mt-4 text-sm" aria-label="Caption for LinkedIn" onFocus={(e) => e.currentTarget.select()} />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn border border-line bg-white py-2 text-ink hover:bg-sand">
          {copied ? <CheckCircleIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
          {copied ? "Copied" : "Copy caption"}
        </button>
        <a href={linkedinShareUrl(url)} target="_blank" rel="noopener noreferrer" className="btn bg-[#0a66c2] py-2 text-white hover:bg-[#004182]">
          <SocialIcon network="linkedin" width={16} height={16} />
          Share on LinkedIn
        </a>
      </div>
      <p className="mt-3 text-xs text-muted">
        The preview is only shown for a published post on the live website. If LinkedIn shows an old preview after an edit, refresh it at linkedin.com/post-inspector.
      </p>
    </div>
  );
}

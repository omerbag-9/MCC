"use client";

import { useState } from "react";

export type LinkOption = { value: string; label: string };

/**
 * Where a button goes: a choice of the site's own destinations, or "Another link…" with an
 * address box. Sends `choiceName` (the choice, "custom" for the box) and `urlName` (the address).
 */
export function LinkField({
  id,
  label,
  choiceName,
  urlName,
  options,
  defaultChoice,
  defaultUrl,
  hint,
}: {
  id: string;
  label: string;
  choiceName: string;
  urlName: string;
  options: LinkOption[];
  defaultChoice: string;
  defaultUrl: string;
  hint?: string;
}) {
  const [choice, setChoice] = useState(defaultChoice);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} name={choiceName} value={choice} onChange={(e) => setChoice(e.target.value)} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        <option value="custom">Another link…</option>
      </select>
      {choice === "custom" ? (
        <input
          id={`${id}-url`}
          name={urlName}
          defaultValue={defaultUrl}
          required
          placeholder="/contact or https://…"
          aria-label="Link address"
          className="field mt-2"
        />
      ) : (
        <input type="hidden" name={urlName} value="" />
      )}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

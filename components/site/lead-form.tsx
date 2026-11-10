"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead, type LeadFormState } from "@/lib/actions/lead";
import { Turnstile, type TurnstileHandle } from "./turnstile";

const initialState: LeadFormState = { status: "idle" };

export function LeadForm({
  pageSource,
  services,
  turnstileSiteKey,
  dark = false,
  labels,
}: {
  pageSource: string;
  services: string[];
  turnstileSiteKey: string;
  dark?: boolean;
  /** Texts from Admin → Website content. */
  labels?: { button: string; successTitle: string; successText: string };
}) {
  const [state, action, pending] = useActionState(submitLead, initialState);
  const turnstile = useRef<TurnstileHandle>(null);

  // Turnstile tokens are single-use: get a fresh one after a failed attempt.
  useEffect(() => {
    if (state.status === "error") turnstile.current?.reset();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className={`p-8 text-center ${dark ? "bg-navy-2 text-paper" : "bg-sand text-ink"}`} role="status">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-ink text-paper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="m5 12 5 5 9-10" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold">{labels?.successTitle ?? "Thank you! We received your request."}</p>
        <p className={`mt-1 ${dark ? "text-on-navy-muted" : "text-muted"}`}>{labels?.successText ?? "Our team will get back to you shortly."}</p>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  const labelCls = dark ? "label text-white/85" : "label";
  const errCls = `mt-1 text-sm ${dark ? "text-red-300" : "text-red-700"}`;

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="hidden" name="pageSource" value={pageSource} />
      {/* Honeypot field, hidden from humans */}
      <div className="hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`name-${pageSource}`} className={labelCls}>Full name *</label>
        <input id={`name-${pageSource}`} name="name" required autoComplete="name" className="field" aria-invalid={!!err.name} />
        {err.name && <p className={errCls}>{err.name}</p>}
      </div>

      <div>
        <label htmlFor={`phone-${pageSource}`} className={labelCls}>Phone</label>
        <input id={`phone-${pageSource}`} name="phone" type="tel" autoComplete="tel" className="field" aria-invalid={!!err.phone} />
        {err.phone && <p className={errCls}>{err.phone}</p>}
      </div>

      <div>
        <label htmlFor={`email-${pageSource}`} className={labelCls}>Email</label>
        <input id={`email-${pageSource}`} name="email" type="email" autoComplete="email" className="field" aria-invalid={!!err.email} />
        {err.email && <p className={errCls}>{err.email}</p>}
      </div>

      {services.length > 0 && (
        <div className="sm:col-span-2">
          <label htmlFor={`service-${pageSource}`} className={labelCls}>Service</label>
          <select id={`service-${pageSource}`} name="serviceInterest" className="field" defaultValue="">
            <option value="">Select a service (optional)</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      <div className="sm:col-span-2">
        <label htmlFor={`message-${pageSource}`} className={labelCls}>Tell us about your project</label>
        <textarea id={`message-${pageSource}`} name="message" rows={4} className="field" aria-invalid={!!err.message} />
        {err.message && <p className={errCls}>{err.message}</p>}
      </div>

      {turnstileSiteKey && (
        <div className="sm:col-span-2">
          <Turnstile siteKey={turnstileSiteKey} ref={turnstile} />
        </div>
      )}

      {state.status === "error" && state.message && (
        <p className={`${errCls} font-medium sm:col-span-2`} role="alert">{state.message}</p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
          {pending ? "Sending…" : (labels?.button ?? "Send message")}
        </button>
      </div>
    </form>
  );
}

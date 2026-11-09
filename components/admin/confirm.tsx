"use client";

import { useCallback, useRef, useState } from "react";

type Ask = { title: string; body?: string; confirm: string; danger?: boolean };

/**
 * Styled confirm dialog instead of window.confirm(). `confirm()` resolves true or false;
 * render `dialog` once in the component.
 */
export function useConfirm() {
  const ref = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);

  const confirm = useCallback((a: Ask) => {
    setAsk(a);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      requestAnimationFrame(() => ref.current?.showModal());
    });
  }, []);

  const close = (ok: boolean) => {
    ref.current?.close();
    resolver.current?.(ok);
    resolver.current = null;
  };

  const dialog = (
    <dialog
      ref={ref}
      className="m-auto w-[min(440px,calc(100vw-2rem))] bg-paper p-0 text-ink shadow-2xl shadow-black/30 backdrop:bg-ink/60"
      onCancel={() => {
        resolver.current?.(false);
        resolver.current = null;
      }}
      onClick={(e) => {
        if (e.target === ref.current) close(false);
      }}
    >
      {ask && (
        <div className="p-7">
          <h2 className="text-lead font-semibold">{ask.title}</h2>
          {ask.body && <p className="mt-2 text-[15px] text-muted">{ask.body}</p>}
          <div className="mt-7 flex justify-end gap-2">
            <button type="button" className="btn border border-line bg-paper py-2 text-ink hover:bg-sand" onClick={() => close(false)} autoFocus>
              Cancel
            </button>
            <button
              type="button"
              className={`btn py-2 text-white ${ask.danger === false ? "bg-ink hover:bg-ink-soft" : "bg-red-700 hover:bg-red-800"}`}
              onClick={() => close(true)}
            >
              {ask.confirm}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );

  return { confirm, dialog };
}

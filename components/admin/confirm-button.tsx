"use client";

import { useRef } from "react";
import { useConfirm } from "./confirm";

/** Submit button that asks first, in a styled dialog, then submits its form. */
export function ConfirmButton({
  message,
  body,
  confirmLabel = "Delete",
  className,
  children,
}: {
  message: string;
  body?: string;
  confirmLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <button
        ref={ref}
        type="button"
        className={className}
        onClick={async () => {
          if (await confirm({ title: message, body, confirm: confirmLabel })) ref.current?.form?.requestSubmit();
        }}
      >
        {children}
      </button>
      {dialog}
    </>
  );
}

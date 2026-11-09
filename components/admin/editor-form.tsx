"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ActionResult } from "@/lib/actions/admin";
import { SaveBar } from "./save-bar";
import { toast } from "./toast";

/**
 * A form whose fields are ordinary inputs with default values. Any edit shows the save bar;
 * Save sends the form to a server action that returns a result, Discard resets the fields.
 */
export function EditorForm({
  action,
  children,
  className,
  savedMessage = "Saved. The website shows the changes on the next visit.",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  savedMessage?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const form = ref.current;
    if (!form) return;
    if (!form.reportValidity()) return;
    setSaving(true);
    try {
      const result = await action(new FormData(form));
      if (result.ok) {
        setDirty(false);
        toast(savedMessage);
        router.refresh();
      } else {
        toast(result.error);
      }
    } catch {
      toast("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      ref={ref}
      className={className}
      onInput={() => setDirty(true)}
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {children}
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => {
          ref.current?.reset();
          setDirty(false);
        }}
      />
    </form>
  );
}

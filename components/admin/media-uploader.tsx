"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { addProjectMedia } from "@/lib/actions/admin";
import { uploadMedia, type UploadedMedia } from "@/lib/client/upload";

export function MediaUploader({ projectId }: { projectId: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const uploaded: UploadedMedia[] = [];
    const list = Array.from(files);
    try {
      for (const [i, file] of list.entries()) {
        setStatus(`Uploading ${i + 1} of ${list.length}: ${file.name}`);
        uploaded.push(
          await uploadMedia(file, "projects", (f) =>
            setStatus(`Uploading ${i + 1} of ${list.length}: ${file.name} (${Math.round(f * 100)}%)`),
          ),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
    if (uploaded.length > 0) {
      setStatus("Saving…");
      const result = await addProjectMedia(projectId, uploaded);
      if (!result.ok) setError(result.error);
    }
    setStatus(null);
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-white p-6 text-center">
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
        className="sr-only"
        id={`upload-${projectId}`}
        disabled={busy}
        onChange={(e) => onFiles(e.target.files)}
      />
      <label htmlFor={`upload-${projectId}`} className={`btn-dark cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "Uploading…" : "Upload photos / videos"}
      </label>
      <p className="mt-3 text-xs text-muted">
        Photos are resized and compressed automatically. Videos: MP4 or WebM, keep them short (under 100 MB; under 25 MB unless direct R2 uploads are configured).
      </p>
      {status && <p className="mt-3 text-sm text-ink-soft" role="status">{status}</p>}
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}

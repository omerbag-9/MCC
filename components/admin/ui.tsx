import Link from "next/link";

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {action}
    </div>
  );
}

/** Success / error banner driven by ?saved=1, ?deleted=1, ?refreshed=1 or ?error=... */
export function Flash({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  const message = searchParams.saved
    ? "Saved. The public site will show the changes on the next visit."
    : searchParams.deleted
      ? "Deleted."
      : searchParams.refreshed
        ? "The public site cache has been refreshed."
        : null;
  if (error) {
    return <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200" role="alert">{error}</div>;
  }
  if (message) {
    return <div className="mb-6 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200" role="status">{message}</div>;
  }
  return null;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-white p-5 shadow-sm ring-1 ring-line sm:p-6 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "amber" | "blue" | "red" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-sky-100 text-sky-800",
    red: "bg-red-100 text-red-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const LEAD_STATUS_TONE = { new: "amber", contacted: "blue", won: "green", lost: "gray" } as const;

export function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  hint,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}{required && " *"}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className="field" />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({
  name,
  label,
  defaultValue,
  rows = 4,
  hint,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}{required && " *"}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="field" />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-medium">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 rounded border-line accent-brand" />
      {label}
    </label>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-white px-6 py-10 text-center text-sm text-muted ring-1 ring-line">{children}</p>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-block text-sm text-muted hover:text-ink">
      ← {children}
    </Link>
  );
}

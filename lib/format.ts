export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Non-empty trimmed lines of a text field. */
export function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

/** "Label: value" lines as rows; a line without a colon becomes a row with no label. */
export function specRows(text: string): [string, string][] {
  return lines(text).map((l) => {
    const i = l.indexOf(":");
    return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ["", l];
  });
}

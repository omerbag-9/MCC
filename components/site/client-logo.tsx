import type { Client } from "@/lib/db/schema";
import { mediaUrl } from "@/lib/media";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** Four simple marks; each client without an uploaded logo gets one, picked from its name. */
const SHAPES = [
  <circle key="c" cx="24" cy="24" r="22" />,
  <rect key="s" x="3" y="3" width="42" height="42" />,
  <path key="h" d="M24 2l19 11v22L24 46 5 35V13z" />,
  <path key="d" d="M24 2l22 22-22 22L2 24z" />,
];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * A client's uploaded logo, or a logotype built from its name (a mark with its initials beside
 * the name set in two lines), so the strip always reads as logos, never as a line of text.
 */
export function ClientLogo({ client, mediaBase }: { client: Client; mediaBase: string }) {
  const src = mediaUrl(client.logoKey, mediaBase);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={client.name} loading="lazy" className="max-h-14 max-w-[80%] object-contain" />;
  }
  const words = client.name.split(/\s+/);
  const first = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const rest = words.slice(Math.ceil(words.length / 2)).join(" ");
  return (
    <span className="flex items-center gap-3" role="img" aria-label={client.name}>
      <svg viewBox="0 0 48 48" className="size-11 shrink-0 fill-current" aria-hidden>
        {SHAPES[hash(client.name) % SHAPES.length]}
        <text x="24" y="25" textAnchor="middle" dominantBaseline="central" className="fill-paper text-[17px] font-bold">
          {initials(client.name)}
        </text>
      </svg>
      <span className="text-[17px] leading-[1.05] font-bold tracking-tight">
        {first}
        {rest && <span className="block font-medium">{rest}</span>}
      </span>
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** Four simple shapes; a client without an uploaded logo gets one, picked from its name. */
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

/** Stand-in mark (a shape with the initials) for a client whose logo hasn't been uploaded yet. */
export function ClientMark({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`fill-current ${className ?? ""}`} role="img" aria-label={name}>
      {SHAPES[hash(name) % SHAPES.length]}
      <text x="24" y="25" textAnchor="middle" dominantBaseline="central" className="fill-paper text-[17px] font-bold">
        {initials(name)}
      </text>
    </svg>
  );
}

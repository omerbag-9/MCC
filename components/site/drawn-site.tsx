/**
 * Fallback picture, drawn from the subject: a building going up beside a tower crane, in the
 * palette's own colours. Shown wherever the company hasn't uploaded a photograph yet.
 */
export function DrawnSite({ className, label = "A building under construction" }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label={label}
      className={className}
    >
      <rect width="1600" height="1000" fill="#0b1f3a" />
      {/* finished floors */}
      <g fill="#1a365e">
        <rect x="760" y="430" width="420" height="570" />
        <rect x="1180" y="560" width="250" height="440" />
      </g>
      {/* window openings */}
      <g fill="#0b1f3a">
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 5 }).map((__, c) => (
            <rect key={`${r}-${c}`} x={790 + c * 78} y={470 + r * 76} width="44" height="40" />
          )),
        )}
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 3 }).map((__, c) => (
            <rect key={`b${r}-${c}`} x={1206 + c * 74} y={600 + r * 76} width="40" height="40" />
          )),
        )}
      </g>
      {/* floors still being framed */}
      <g fill="#2a4a77">
        <rect x="760" y="300" width="420" height="16" />
        <rect x="760" y="365" width="420" height="16" />
        <rect x="770" y="300" width="14" height="130" />
        <rect x="900" y="300" width="14" height="130" />
        <rect x="1030" y="300" width="14" height="130" />
        <rect x="1156" y="300" width="14" height="130" />
      </g>
      {/* tower crane */}
      <g fill="#c8d2e1">
        <rect x="560" y="140" width="22" height="860" />
        <rect x="300" y="140" width="1000" height="18" />
        <rect x="300" y="158" width="120" height="40" />
        <rect x="548" y="96" width="46" height="44" />
        <rect x="1030" y="158" width="4" height="250" />
        <rect x="1004" y="408" width="56" height="30" />
      </g>
      {/* ground */}
      <rect y="980" width="1600" height="20" fill="#132b4d" />
    </svg>
  );
}

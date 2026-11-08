import CountUp from "@/components/reactbits/CountUp";

/** "25+" -> counts 0..25 with a "+" suffix (React Bits CountUp). Non-numeric values are shown as written. */
export function Stat({ value }: { value: string }) {
  const m = value.trim().match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return <>{value}</>;
  const to = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(to)) return <>{value}</>;
  return <CountUp to={to} prefix={m[1]} suffix={m[3]} separator={m[2].includes(",") ? "," : ""} duration={1.6} />;
}

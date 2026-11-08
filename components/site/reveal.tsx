import FadeContent from "@/components/reactbits/FadeContent";

/**
 * Quiet entrance for a section's parts (React Bits FadeContent): children fade in one after
 * another, once, as they enter the view. No movement, honours reduced motion.
 */
export function Reveal({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <FadeContent className={className} duration={0.7} stagger={stagger} delay={delay} threshold={0.15}>
      {children}
    </FadeContent>
  );
}

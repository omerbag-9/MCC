import AnimatedContent from "@/components/reactbits/AnimatedContent";

/**
 * Entrance for a section's parts (React Bits AnimatedContent): each child rises 24px and fades in,
 * one after another, once, as it enters the view. Honours reduced motion.
 */
export function Reveal({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  id,
  onLoad = false,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  id?: string;
  /** Play on page load instead of when scrolled into view (for things at the bottom of the first screen). */
  onLoad?: boolean;
}) {
  return (
    <AnimatedContent
      id={id}
      className={className}
      distance={24}
      duration={0.8}
      ease="power3.out"
      initialOpacity={0}
      animateOpacity
      stagger={stagger}
      delay={delay}
      threshold={0.15}
      trigger={onLoad ? "mount" : "scroll"}
    >
      {children}
    </AnimatedContent>
  );
}

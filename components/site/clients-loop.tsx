"use client";

import LogoLoop from "@/components/reactbits/LogoLoop";
import { ClientMark } from "./client-logo";

type ClientItem = { id: number; name: string; url: string; logo: string | null };

/**
 * The clients' logos only, moving slowly from edge to edge (React Bits LogoLoop). Logos sit in
 * the ink tone and take their own colours on hover; it pauses while hovered and can be dragged.
 */
export function ClientsLoop({ clients }: { clients: ClientItem[] }) {
  return (
    <LogoLoop
      logos={clients.map((c) => ({
        node: c.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.logo}
            alt={c.name}
            loading="lazy"
            draggable={false}
            className="h-12 w-auto max-w-56 object-contain opacity-75 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0 lg:h-16 lg:max-w-64"
          />
        ) : (
          <ClientMark name={c.name} className="size-12 text-ink opacity-75 transition-opacity duration-300 hover:opacity-100 lg:size-16" />
        ),
        href: c.url || undefined,
        title: c.name,
        ariaLabel: c.name,
      }))}
      speed={45}
      logoHeight={64}
      gap={96}
      pauseOnHover
      fadeOut={false}
      ariaLabel="Our clients"
    />
  );
}

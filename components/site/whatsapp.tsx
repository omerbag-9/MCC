"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./icons";

function track(page: string) {
  try {
    const body = JSON.stringify({ page });
    if (!navigator.sendBeacon?.("/api/wa-click", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/wa-click", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    // tracking must never block the click
  }
}

export function WhatsAppLink({
  href,
  className,
  children,
  label = "Chat with us on WhatsApp",
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const pathname = usePathname();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={children ? undefined : label}
      onClick={() => track(pathname)}
    >
      {children ?? <WhatsAppIcon />}
    </a>
  );
}

export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <WhatsAppLink
      href={href}
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#15753a] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
      label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon width={30} height={30} />
      <span className="sr-only">Chat with us on WhatsApp</span>
    </WhatsAppLink>
  );
}

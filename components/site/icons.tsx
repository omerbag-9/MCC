import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

/** Icons available for services (key stored in services.icon). */
export const SERVICE_ICONS = {
  building: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
      <path d="M15 9h4a1 1 0 0 1 1 1v11" />
      <path d="M2 21h20M8 8h3M8 12h3M8 16h3" />
    </svg>
  ),
  home: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11h14V9" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  hammer: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m14 7-9.5 9.5a2.1 2.1 0 0 0 3 3L17 10" />
      <path d="M12 5.5 15.5 2 22 8.5 18.5 12z" />
    </svg>
  ),
  ruler: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3 17 17 3l4 4L7 21z" />
      <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
    </svg>
  ),
  helmet: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M2 16h20v3H2zM10 8V5h4v3" />
    </svg>
  ),
  paint: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="3" width="15" height="6" rx="1" />
      <path d="M18 6h3v5h-9v3" />
      <rect x="10" y="14" width="4" height="7" rx="1" />
    </svg>
  ),
  wrench: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
    </svg>
  ),
  road: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M8 3 4 21M16 3l4 18M12 4v3M12 10.5v3M12 17v3" />
    </svg>
  ),
  factory: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M2 21V10l6 4v-4l6 4V4h6v17z" />
      <path d="M2 21h20M7 17h2M12 17h2M17 17h2" />
    </svg>
  ),
  key: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M17 6l3 3M14 9l2 2" />
    </svg>
  ),
} as const;

export type ServiceIconName = keyof typeof SERVICE_ICONS;

export function ServiceIcon({ name, ...props }: { name: string } & IconProps) {
  const Icon = SERVICE_ICONS[name as ServiceIconName] ?? SERVICE_ICONS.building;
  return <Icon {...props} />;
}

export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const QuoteIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M9.5 6C6 7.4 4 10.2 4 14v4h6v-6H7.2c.2-2 1.4-3.6 3.3-4.5zM19.5 6C16 7.4 14 10.2 14 14v4h6v-6h-2.8c.2-2 1.4-3.6 3.3-4.5z" />
  </svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2m4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3" />
  </svg>
);

export const SocialIcon = ({ network, ...p }: { network: string } & IconProps) => {
  switch (network) {
    case "facebook":
      return (
        <svg {...base(p)}>
          <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...base(p)}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...base(p)}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...base(p)}>
          <rect x="2.5" y="5" width="19" height="14" rx="4" />
          <path d="m10 9 5 3-5 3z" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...base(p)}>
          <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3a5 5 0 0 0 5 5" />
        </svg>
      );
  }
};

import type { ReactElement, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  size?: number;
  strokeWidth?: number;
};

function base({ size = 20, strokeWidth = 1.7, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const Icon = {
  store: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3 9.5 4.6 4.8A1.4 1.4 0 0 1 5.9 3.8h12.2a1.4 1.4 0 0 1 1.3.9L21 9.5" />
      <path d="M3 9.5h18" />
      <path d="M4.5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 19V9.5" />
      <path d="M9.5 20.5v-6h5v6" />
      <path d="M3 9.5a2.6 2.6 0 0 0 4.2 2.1M7.2 9.5a2.6 2.6 0 0 0 4.8 0 2.5 2.5 0 0 0 4.8 0 2.6 2.6 0 0 0 4.2 2.1" />
    </svg>
  ),
  user: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.6 20.2a7.6 7.6 0 0 1 14.8 0" />
    </svg>
  ),
  users: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3.3" />
      <path d="M2.8 20a6.4 6.4 0 0 1 12.4 0" />
      <path d="M16 5.2a3.3 3.3 0 0 1 0 6.4M17.6 14.4A6 6 0 0 1 21.4 20" />
    </svg>
  ),
  link: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M10.4 13.6a4.2 4.2 0 0 0 6 0l2.4-2.4a4.24 4.24 0 0 0-6-6l-1.2 1.2" />
      <path d="M13.6 10.4a4.2 4.2 0 0 0-6 0l-2.4 2.4a4.24 4.24 0 0 0 6 6l1.2-1.2" />
    </svg>
  ),
  palette: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3.2-3.4 3.2h-1.4a1.9 1.9 0 0 0-1.4 3.2c.6.7.2 2.6-1.8 2.6Z" />
      <circle cx="7.6" cy="10.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="6.9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.2" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  notes: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M6 3.5h9.5L20 8v11.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 5 19.5v-14A2 2 0 0 1 6 3.5Z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  spark: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3.5 13.7 9l5.5 1.7L13.7 12.4 12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M18.4 16.4l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
    </svg>
  ),
  sparkles: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M9.5 3.8 11 8.4l4.6 1.5L11 11.4 9.5 16 8 11.4 3.4 9.9 8 8.4 9.5 3.8Z" />
      <path d="M17.8 13.4l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z" />
      <path d="M17.6 3.4l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8Z" />
    </svg>
  ),
  phone: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M7.4 3.8h2l1.4 3.6-1.8 1.3a11 11 0 0 0 5.3 5.3l1.3-1.8 3.6 1.4v2a2.4 2.4 0 0 1-2.6 2.4A15.4 15.4 0 0 1 5 6.4a2.4 2.4 0 0 1 2.4-2.6Z" />
    </svg>
  ),
  mail: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="m4 7.5 8 5.4 8-5.4" />
    </svg>
  ),
  globe: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.1 12 20.5C9.6 18.1 8.4 15.2 8.4 12S9.6 5.9 12 3.5Z" />
    </svg>
  ),
  shield: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3 5 5.6v5.9c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V5.6L12 3Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </svg>
  ),
  chevron: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  ),
  chevronRight: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  ),
  arrowRight: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </svg>
  ),
  arrowLeft: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M19.5 12h-15M10.5 18l-6-6 6-6" />
    </svg>
  ),
  check: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  plus: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M5 12h14" />
    </svg>
  ),
  trash: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4.5 7h15M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7l.9 11.3A1.8 1.8 0 0 0 9.2 20h5.6a1.8 1.8 0 0 0 1.8-1.7L17.5 7" />
      <path d="M10.5 11v5M13.5 11v5" />
    </svg>
  ),
  copy: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 6.2V5.8A1.8 1.8 0 0 0 13.2 4H5.8A1.8 1.8 0 0 0 4 5.8v7.4A1.8 1.8 0 0 0 5.8 15h.4" />
    </svg>
  ),
  external: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M14 4.5h5.5V10" />
      <path d="M19 5 11 13" />
      <path d="M18 14.5v4.3a1.7 1.7 0 0 1-1.7 1.7H5.2A1.7 1.7 0 0 1 3.5 18.8V7.7A1.7 1.7 0 0 1 5.2 6h4.3" />
    </svg>
  ),
  bolt: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M13.4 2.8 5.5 13.6h5.2l-.9 7.6 8-11h-5.2l.8-7.4Z" />
    </svg>
  ),
  chart: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7.5" y="12" width="3" height="5" rx="1" />
      <rect x="12.5" y="8.5" width="3" height="8.5" rx="1" />
      <rect x="17" y="5.5" width="3" height="11.5" rx="1" />
    </svg>
  ),
  forms: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.6" />
      <path d="M8 8.5h8M8 12h8M8 15.5h4.5" />
    </svg>
  ),
  inbox: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3.5 13.5 6 5.2A1.8 1.8 0 0 1 7.7 4h8.6A1.8 1.8 0 0 1 18 5.2l2.5 8.3" />
      <path d="M3.5 13.5h4.2l1.1 2.4h6.4l1.1-2.4h4.2v4.3a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-4.3Z" />
    </svg>
  ),
  layers: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m12 3.5 8.5 4.4L12 12.3 3.5 7.9 12 3.5Z" />
      <path d="m4 12.2 8 4.2 8-4.2M4 16.4l8 4.1 8-4.1" />
    </svg>
  ),
  settings: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.2 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5.9Z" />
    </svg>
  ),
  logout: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M14.5 4.5h2.8A1.7 1.7 0 0 1 19 6.2v11.6a1.7 1.7 0 0 1-1.7 1.7h-2.8" />
      <path d="M10 8.5 6.5 12l3.5 3.5M6.8 12H15" />
    </svg>
  ),
  menu: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  search: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  ),
  hash: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M9.5 4 7.5 20M16.5 4l-2 16M4.5 9h15M3.8 15h15" />
    </svg>
  ),
  type: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4.5 6.5V5h15v1.5M12 5v14M8.8 19h6.4" />
    </svg>
  ),
  stack: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3.5" y="4" width="17" height="5" rx="1.8" />
      <rect x="3.5" y="12" width="17" height="5" rx="1.8" />
      <path d="M17 19.8h.1" />
    </svg>
  ),
  eye: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </svg>
  ),
  download: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3.5v11M7.5 10.5l4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </svg>
  ),
  alert: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v5M12 16.2h.01" />
    </svg>
  ),
  clock: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  ),
  drag: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  map: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  facebook: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M14.8 8.4h2V5.2h-2.4c-2.2 0-3.4 1.3-3.4 3.5v1.7H9v3.2h2v6.2h3.2v-6.2h2.3l.5-3.2h-2.8V9.2c0-.5.2-.8.6-.8Z" />
    </svg>
  ),
  instagram: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="5" />
      <circle cx="12" cy="12" r="3.7" />
      <circle cx="16.9" cy="7.1" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M14.4 3.5v9.9a3.9 3.9 0 1 1-3.2-3.8" />
      <path d="M14.4 5.6a5 5 0 0 0 4.6 4.7" />
    </svg>
  ),
  tripadvisor: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="7" cy="13" r="3.6" />
      <circle cx="17" cy="13" r="3.6" />
      <path d="M7 13h.01M17 13h.01" />
      <path d="M4.2 9.4 7.6 6.8A7.4 7.4 0 0 1 12 5.6a7.4 7.4 0 0 1 4.4 1.2l3.4 2.6" />
    </svg>
  ),
  linkedin: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3.2" />
      <path d="M7.6 10.4v6M7.6 7.7v.1M11.4 16.4v-3.2a2.1 2.1 0 0 1 4.2 0v3.2" />
    </svg>
  ),
  pinterest: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M9.9 19.4c.5-1.6 1.2-4.2 1.5-5.4M10.6 12.6c-.4-.8-.5-1.6-.3-2.4a3 3 0 0 1 5.7.8c0 2.1-1.4 3.8-3 3.6-.9-.1-1.4-.8-1.2-1.7" />
    </svg>
  ),
  youtube: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="2.8" y="5.6" width="18.4" height="12.8" rx="4" />
      <path d="m10.4 9.4 4.6 2.6-4.6 2.6V9.4Z" />
    </svg>
  ),
  x: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4.4 4.2h3.8l4.1 5.6 4.8-5.6h2.5l-6.1 7.1 6.5 8.5h-3.8l-4.5-6-5.1 6H4.1l6.5-7.6L4.4 4.2Z" />
    </svg>
  ),
  whatsapp: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M20.4 11.7a8.3 8.3 0 0 1-12.3 7.3L3.6 20.4l1.3-4.4a8.3 8.3 0 1 1 15.5-4.3Z" />
      <path d="M9 9.3c0 3.2 2.5 5.7 5.7 5.7.6 0 1-.5 1-1v-.8l-1.6-.7-.7.8a4.4 4.4 0 0 1-2.2-2.2l.8-.7-.7-1.6h-.9c-.5 0-.9.4-.9 1Z" />
    </svg>
  ),
  qr: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1.4" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1.4" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1.4" />
      <path d="M14.5 14.5h2.5v2.5H14.5zM19 14.5h1.5M14.5 19.5h6" />
    </svg>
  ),
  filter: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 6.5h16l-6.2 7.3v5.1l-3.6 1.6v-6.7L4 6.5Z" />
    </svg>
  ),
  code: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m9 8-4.5 4 4.5 4M15 8l4.5 4-4.5 4" />
    </svg>
  ),
  paletteSwatch: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17" />
    </svg>
  ),
};

export type IconName = keyof typeof Icon;

export function DynamicIcon({ name, ...props }: { name: string } & IconProps) {
  const Component =
    (Icon as Record<string, (p: IconProps) => ReactElement>)[name] ?? Icon.spark;
  return <Component {...props} />;
}

export const PLATFORM_ICONS: Record<string, IconName> = {
  "google-maps": "map",
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  pinterest: "pinterest",
  tiktok: "tiktok",
  youtube: "youtube",
  x: "x",
  tripadvisor: "tripadvisor",
  website: "globe",
  whatsapp: "whatsapp",
  maps: "map",
};

function IconBase({ children, className = "h-5 w-5", strokeWidth = "1.6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function BuildingsIcon({ className }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="8" width="7" height="13" rx="1" />
      <rect x="10" y="3" width="11" height="18" rx="1" />
      <path d="M6 11h1M6 14h1M6 17h1" />
      <path d="M13 7h2M13 11h2M13 15h2M17 7h1M17 11h1M17 15h1" />
      <path d="M13 21v-4h4v4" />
    </IconBase>
  );
}

export function PricingIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M3 3h18v4H3z" rx="1" />
      <path d="M3 10h11" />
      <path d="M3 14h8" />
      <path d="M3 18h6" />
      <circle cx="17.5" cy="16.5" r="3.5" />
      <path d="M17.5 15v1.5l1 1" />
    </IconBase>
  );
}

export function SuppliersIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M3 9h3.5A1.5 1.5 0 0 0 8 7.5v0A1.5 1.5 0 0 0 6.5 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1.5A1.5 1.5 0 0 0 16 7.5v0A1.5 1.5 0 0 0 17.5 9H21" />
      <path d="M8 12h8M8 16h5" />
      <circle cx="12" cy="4" r="2" />
    </IconBase>
  );
}

export function SettingsIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </IconBase>
  );
}

export function SearchIcon({ className }) {
  return (
    <IconBase className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </IconBase>
  );
}

export function StarIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </IconBase>
  );
}

export function FolderIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </IconBase>
  );
}

export function BoxIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </IconBase>
  );
}

export function TruckIcon({ className }) {
  return (
    <IconBase className={className}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8Z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </IconBase>
  );
}

export function UserIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
  );
}

export function ChevronLeftIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </IconBase>
  );
}

export function ChevronRightIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </IconBase>
  );
}

export function XIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  );
}

export function CheckIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </IconBase>
  );
}

export function PhoneIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </IconBase>
  );
}

export function MailIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </IconBase>
  );
}

export function ShareIcon({ className }) {
  return (
    <IconBase className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </IconBase>
  );
}

export function PlusIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconBase>
  );
}

export function ArrowRightIcon({ className }) {
  return (
    <IconBase className={className} strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </IconBase>
  );
}

export function SaveIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </IconBase>
  );
}

export function FilterIcon({ className }) {
  return (
    <IconBase className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </IconBase>
  );
}

export function TagIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </IconBase>
  );
}

export function TrendingUpIcon({ className }) {
  return (
    <IconBase className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </IconBase>
  );
}

export function ShieldIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </IconBase>
  );
}

export function LogOutIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconBase>
  );
}

export function GlobeIcon({ className }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconBase>
  );
}

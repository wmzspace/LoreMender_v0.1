import type { ClueIconType } from "../../data/types";

interface ClueIconProps {
  type: ClueIconType;
  size?: number;
}

export function ClueIcon({ type, size = 56 }: ClueIconProps) {
  const props = { width: size, height: size, viewBox: "0 0 60 60" };
  if (type === "scroll") return (
    <svg {...props}>
      <rect x="6" y="14" width="48" height="32" fill="#e9d4a6"/>
      <rect x="2" y="10" width="6" height="40" fill="#8a6e3f"/>
      <rect x="52" y="10" width="6" height="40" fill="#8a6e3f"/>
      <line x1="12" y1="22" x2="48" y2="22" stroke="#3a2a14" strokeWidth="0.8"/>
      <line x1="12" y1="28" x2="44" y2="28" stroke="#3a2a14" strokeWidth="0.8"/>
      <line x1="12" y1="34" x2="48" y2="34" stroke="#3a2a14" strokeWidth="0.8"/>
      <line x1="12" y1="40" x2="40" y2="40" stroke="#3a2a14" strokeWidth="0.8"/>
      <rect x="40" y="36" width="8" height="8" fill="#a8311f" opacity="0.85"/>
    </svg>
  );
  if (type === "ledger") return (
    <svg {...props}>
      <rect x="10" y="8" width="40" height="46" fill="#e9d4a6" stroke="#8a6e3f"/>
      <rect x="10" y="8" width="40" height="6" fill="#a8311f"/>
      <line x1="16" y1="22" x2="44" y2="22" stroke="#3a2a14" strokeWidth="0.7"/>
      <line x1="16" y1="28" x2="44" y2="28" stroke="#3a2a14" strokeWidth="0.7"/>
      <line x1="16" y1="34" x2="44" y2="34" stroke="#3a2a14" strokeWidth="0.7"/>
      <line x1="16" y1="40" x2="40" y2="40" stroke="#3a2a14" strokeWidth="0.7"/>
      <line x1="16" y1="46" x2="36" y2="46" stroke="#3a2a14" strokeWidth="0.7"/>
    </svg>
  );
  if (type === "lips") return (
    <svg {...props}>
      <circle cx="30" cy="30" r="20" fill="none" stroke="#c9a14a" strokeWidth="1.2"/>
      <path d="M20 30 Q30 22 40 30 Q30 38 20 30 Z" fill="#a8311f"/>
      <line x1="22" y1="30" x2="38" y2="30" stroke="#3a2a14" strokeWidth="0.8"/>
      <path d="M30 14 L30 8" stroke="#c9a14a" strokeWidth="1"/>
      <path d="M30 14 L26 10 M30 14 L34 10" stroke="#c9a14a" strokeWidth="1"/>
    </svg>
  );
  if (type === "music") return (
    <svg {...props}>
      <path d="M20 14 L20 42" stroke="#c9a14a" strokeWidth="2"/>
      <ellipse cx="16" cy="42" rx="5" ry="3.5" fill="#c9a14a"/>
      <path d="M20 14 Q34 16 38 22 L38 18 Q32 12 20 10 Z" fill="#c9a14a"/>
      <path d="M40 22 L40 46" stroke="#c9a14a" strokeWidth="2"/>
      <ellipse cx="36" cy="46" rx="5" ry="3.5" fill="#c9a14a"/>
      <path d="M20 14 L40 22" stroke="#c9a14a" strokeWidth="1.4"/>
    </svg>
  );
  if (type === "needle") return (
    <svg {...props}>
      <ellipse cx="30" cy="34" rx="14" ry="20" fill="none" stroke="#c9a14a" strokeWidth="1.2"/>
      <g fill="#a8311f">
        <circle cx="26" cy="26" r="1.2"/>
        <circle cx="34" cy="28" r="1.2"/>
        <circle cx="22" cy="34" r="1.2"/>
        <circle cx="38" cy="38" r="1.2"/>
        <circle cx="30" cy="44" r="1.2"/>
      </g>
      <line x1="44" y1="10" x2="20" y2="34" stroke="#c9a14a" strokeWidth="0.8"/>
      <circle cx="44" cy="10" r="1.6" fill="#c9a14a"/>
    </svg>
  );
  return null;
}

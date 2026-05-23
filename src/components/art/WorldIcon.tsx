interface WorldIconProps {
  type: "space" | "pollution" | "mender" | "rule";
}

export function WorldIcon({ type }: WorldIconProps) {
  const props = { viewBox: "0 0 60 60", width: "100%", height: "100%" };
  if (type === "space") return (
    <svg {...props}>
      <circle cx="30" cy="30" r="22" fill="none" stroke="#c9a14a" strokeWidth="0.8"/>
      <circle cx="30" cy="30" r="14" fill="none" stroke="#c9a14a" strokeWidth="0.6" strokeDasharray="2 4"/>
      <circle cx="30" cy="30" r="6" fill="#c9a14a" opacity="0.6"/>
      <text x="30" y="35" textAnchor="middle" fontFamily="ZCOOL XiaoWei, serif" fontSize="16" fill="#0a0604">史</text>
    </svg>
  );
  if (type === "pollution") return (
    <svg {...props}>
      <rect x="10" y="14" width="40" height="32" fill="#e9d4a6" opacity="0.85"/>
      <g stroke="#3a2a14" strokeWidth="0.6" opacity="0.6">
        <line x1="14" y1="20" x2="46" y2="20"/>
        <line x1="14" y1="26" x2="42" y2="26"/>
        <line x1="14" y1="32" x2="46" y2="32"/>
        <line x1="14" y1="38" x2="38" y2="38"/>
      </g>
      <path d="M10 14 L50 46" stroke="#a8311f" strokeWidth="2" opacity="0.85"/>
    </svg>
  );
  if (type === "mender") return (
    <svg {...props}>
      <path d="M16 14 L44 14 L40 50 L20 50 Z" fill="none" stroke="#c9a14a" strokeWidth="1"/>
      <line x1="22" y1="20" x2="38" y2="20" stroke="#c9a14a" strokeWidth="0.6"/>
      <line x1="22" y1="26" x2="36" y2="26" stroke="#c9a14a" strokeWidth="0.6"/>
      <line x1="22" y1="32" x2="38" y2="32" stroke="#c9a14a" strokeWidth="0.6"/>
      <path d="M14 36 L46 30" stroke="#a8311f" strokeWidth="1" strokeDasharray="3 2"/>
      <circle cx="46" cy="30" r="1.4" fill="#a8311f"/>
    </svg>
  );
  if (type === "rule") return (
    <svg {...props}>
      <circle cx="30" cy="30" r="20" fill="none" stroke="#c9a14a" strokeWidth="0.8"/>
      <rect x="22" y="22" width="16" height="16" fill="#a8311f" opacity="0.85"/>
      <text x="30" y="34" textAnchor="middle" fontFamily="ZCOOL XiaoWei, serif" fontSize="11" fill="#fbe3c2">补</text>
    </svg>
  );
  return null;
}

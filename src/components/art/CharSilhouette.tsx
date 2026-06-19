import type { SilhouetteKind } from "../../data/types";

interface CharSilhouetteProps {
  kind: SilhouetteKind;
  accent?: string;
  /** AI-generated portrait image — takes priority over SVG silhouette */
  portrait?: string;
}

export function CharSilhouette({ kind, accent = "#cdb277", portrait }: CharSilhouetteProps) {
  // If a portrait image is provided, render it instead of the SVG silhouette
  if (portrait) {
    return (
      <img
        src={portrait}
        alt="角色头像"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />
    );
  }

  const common = (
    <defs>
      <radialGradient id={`cs-${kind}`} cx="50%" cy="40%" r="60%">
        <stop offset="0" stopColor={accent} stopOpacity="0.35"/>
        <stop offset="1" stopColor="#06090b" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={`csb-${kind}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0a1014"/>
        <stop offset="1" stopColor="#06090b"/>
      </linearGradient>
    </defs>
  );

  let figure: React.ReactNode;
  if (kind === "scholar") {
    figure = (
      <g fill="#06090b" stroke={accent} strokeWidth="0.6" opacity="0.95">
        <path d="M65 30 Q65 18 80 18 Q95 18 95 30 L93 36 L67 36 Z"/>
        <ellipse cx="80" cy="46" rx="13" ry="14"/>
        <path d="M50 100 Q80 60 110 100 L100 160 L60 160 Z"/>
        <line x1="80" y1="64" x2="80" y2="160" strokeWidth="0.6" opacity="0.5"/>
      </g>
    );
  } else if (kind === "rugged") {
    figure = (
      <g fill="#06090b" stroke={accent} strokeWidth="0.6" opacity="0.95">
        <path d="M64 30 Q64 18 80 18 Q96 18 96 30 L94 38 L66 38 Z"/>
        <ellipse cx="80" cy="48" rx="15" ry="14"/>
        <path d="M44 100 Q80 65 116 100 L108 160 L52 160 Z"/>
        <path d="M52 110 L108 110 L106 118 L54 118 Z" fill={accent} opacity="0.5"/>
      </g>
    );
  } else if (kind === "songbird") {
    figure = (
      <g fill="#06090b" stroke={accent} strokeWidth="0.6" opacity="0.95">
        <path d="M58 50 Q60 22 80 22 Q100 22 102 50 Q102 70 80 60 Q58 70 58 50 Z"/>
        <ellipse cx="80" cy="50" rx="12" ry="14"/>
        <path d="M50 100 Q80 72 110 100 L116 160 L44 160 Z"/>
        <line x1="92" y1="32" x2="100" y2="22" stroke={accent} strokeWidth="1.4"/>
        <circle cx="100" cy="22" r="1.6" fill={accent}/>
      </g>
    );
  } else {
    figure = (
      <g fill="#06090b" stroke={accent} strokeWidth="0.6" opacity="0.95">
        <ellipse cx="80" cy="44" rx="13" ry="14"/>
        <path d="M68 38 Q74 28 80 28 Q86 28 92 38 L92 32 Q86 24 80 24 Q74 24 68 32 Z"/>
        <path d="M72 56 L80 78 L88 56 Z" fill={accent} opacity="0.5"/>
        <path d="M48 100 Q80 68 112 100 L102 160 L58 160 Z"/>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 160 170" style={{width:"100%", height:"100%"}}>
      {common}
      <rect width="160" height="170" fill={`url(#csb-${kind})`}/>
      <ellipse cx="80" cy="90" rx="90" ry="80" fill={`url(#cs-${kind})`}/>
      {figure}
    </svg>
  );
}

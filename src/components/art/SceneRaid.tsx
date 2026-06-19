export function SceneRaid() {
  return (
    <svg viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <linearGradient id="rg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1812"/>
          <stop offset="1" stopColor="#0a0805"/>
        </linearGradient>
        <radialGradient id="rg-lantern" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb968" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="#d97a2b" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#0a0805" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="390" height="280" fill="url(#rg-sky)"/>

      <rect y="190" width="390" height="90" fill="#0d0a07"/>
      <g opacity="0.4">
        <line x1="0" y1="200" x2="390" y2="200" stroke="#3a2516"/>
        <line x1="0" y1="220" x2="390" y2="220" stroke="#3a2516"/>
        <line x1="0" y1="240" x2="390" y2="240" stroke="#3a2516"/>
        <line x1="0" y1="260" x2="390" y2="260" stroke="#3a2516"/>
      </g>
      <ellipse cx="160" cy="240" rx="60" ry="6" fill="#3a4a5a" opacity="0.3"/>
      <ellipse cx="300" cy="252" rx="40" ry="4" fill="#3a4a5a" opacity="0.25"/>

      <g>
        <rect x="0" y="60" width="80" height="140" fill="#150c07"/>
        <rect x="80" y="90" width="60" height="110" fill="#1c1108"/>
        <rect x="290" y="50" width="100" height="150" fill="#120a06"/>
        <rect x="240" y="85" width="60" height="115" fill="#1a0f07"/>
        <path d="M0 60 L80 60 L75 50 L5 50 Z" fill="#06090b"/>
        <path d="M290 50 L390 50 L385 40 L295 40 Z" fill="#06090b"/>
      </g>

      <g transform="translate(70 130)">
        <line x1="0" y1="-50" x2="0" y2="-12" stroke="#5a3a20" strokeWidth="1"/>
        <ellipse cx="0" cy="0" rx="14" ry="18" fill="url(#rg-lantern)"/>
        <ellipse cx="0" cy="0" rx="9" ry="13" fill="#ff9d4a" opacity="0.8"/>
        <line x1="-9" y1="0" x2="9" y2="0" stroke="#6b2a18" strokeWidth="0.8"/>
        <circle cx="0" cy="0" r="60" fill="url(#rg-lantern)" opacity="0.5"/>
      </g>
      <g transform="translate(320 110)">
        <line x1="0" y1="-50" x2="0" y2="-12" stroke="#5a3a20" strokeWidth="1"/>
        <ellipse cx="0" cy="0" rx="14" ry="18" fill="url(#rg-lantern)"/>
        <ellipse cx="0" cy="0" rx="9" ry="13" fill="#ff9d4a" opacity="0.8"/>
        <circle cx="0" cy="0" r="55" fill="url(#rg-lantern)" opacity="0.45"/>
      </g>

      <g fill="#06090b" transform="translate(180 130)">
        <ellipse cx="0" cy="0" rx="9" ry="9"/>
        <path d="M-12 6 L-10 60 L-3 60 L0 26 L3 60 L10 60 L12 6 Z"/>
        <line x1="-18" y1="-10" x2="-18" y2="50" stroke="#06090b" strokeWidth="2"/>
        <path d="M-22 -16 L-14 -16 L-14 -8 L-22 -8 Z" fill="#1a0f08"/>
      </g>
      <g fill="#06090b" transform="translate(210 132)">
        <ellipse cx="0" cy="0" rx="9" ry="9"/>
        <path d="M-12 6 L-10 60 L-3 60 L0 26 L3 60 L10 60 L12 6 Z"/>
        <line x1="14" y1="-10" x2="14" y2="50" stroke="#06090b" strokeWidth="2"/>
        <path d="M10 -16 L18 -16 L18 -8 L10 -8 Z" fill="#1a0f08"/>
      </g>

      <ellipse cx="195" cy="200" rx="220" ry="22" fill="#aaa899" opacity="0.08"/>
    </svg>
  );
}

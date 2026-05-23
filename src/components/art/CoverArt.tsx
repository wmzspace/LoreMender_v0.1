export function CoverArt() {
  return (
    <svg viewBox="0 0 390 520" xmlns="http://www.w3.org/2000/svg"
      style={{width:"100%", height:"100%", display:"block"}}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="cg1" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#ffd081" stopOpacity="0.65"/>
          <stop offset="35%" stopColor="#c9852a" stopOpacity="0.35"/>
          <stop offset="70%" stopColor="#3a1f0f" stopOpacity="0.0"/>
        </radialGradient>
        <radialGradient id="cg2" cx="50%" cy="42%" r="35%">
          <stop offset="0%" stopColor="#fff3d0" stopOpacity="0.9"/>
          <stop offset="60%" stopColor="#e7b653" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#a8311f" stopOpacity="0.0"/>
        </radialGradient>
        <linearGradient id="cscroll" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0dcae"/>
          <stop offset="100%" stopColor="#c5a06a"/>
        </linearGradient>
        <filter id="blur1"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>

      <rect width="390" height="520" fill="#0b0805"/>

      <path d="M0 380 L60 320 L120 360 L180 300 L240 350 L300 290 L390 340 L390 520 L0 520 Z"
            fill="#120b08" opacity="0.85"/>
      <path d="M0 420 L70 380 L140 410 L220 370 L300 405 L390 380 L390 520 L0 520 Z"
            fill="#1a0f08" opacity="0.85"/>

      <ellipse cx="195" cy="220" rx="220" ry="200" fill="url(#cg1)"/>
      <ellipse cx="195" cy="210" rx="120" ry="120" fill="url(#cg2)"/>

      <g opacity="0.55" transform="translate(195 215)">
        <circle r="110" fill="none" stroke="#e7c773" strokeWidth="0.5" opacity="0.5"/>
        <circle r="86" fill="none" stroke="#e7c773" strokeWidth="0.5" opacity="0.7" strokeDasharray="2 6"/>
        <circle r="58" fill="none" stroke="#e7c773" strokeWidth="0.5" opacity="0.6"/>
      </g>

      <rect x="186" y="80" width="18" height="280" fill="url(#cg2)" filter="url(#blur1)" opacity="0.7"/>

      <g opacity="0.88">
        <g transform="translate(70 150) rotate(-18)">
          <rect x="0" y="0" width="44" height="60" fill="url(#cscroll)" opacity="0.85"/>
          <line x1="6" y1="12" x2="38" y2="12" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="22" x2="34" y2="22" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="32" x2="38" y2="32" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="42" x2="30" y2="42" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
        </g>
        <g transform="translate(290 130) rotate(14)">
          <rect x="0" y="0" width="50" height="68" fill="url(#cscroll)" opacity="0.85"/>
          <line x1="6" y1="14" x2="42" y2="14" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="26" x2="38" y2="26" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="38" x2="44" y2="38" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="6" y1="50" x2="32" y2="50" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
        </g>
        <g transform="translate(40 320) rotate(8)">
          <rect x="0" y="0" width="38" height="50" fill="url(#cscroll)" opacity="0.8"/>
          <line x1="5" y1="10" x2="32" y2="10" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="5" y1="20" x2="28" y2="20" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="5" y1="30" x2="32" y2="30" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
        </g>
        <g transform="translate(310 320) rotate(-12)">
          <rect x="0" y="0" width="42" height="56" fill="url(#cscroll)" opacity="0.8"/>
          <line x1="5" y1="12" x2="36" y2="12" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="5" y1="24" x2="32" y2="24" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
          <line x1="5" y1="36" x2="38" y2="36" stroke="#3a2a14" strokeWidth="0.8" opacity="0.6"/>
        </g>
      </g>

      <text x="195" y="260" textAnchor="middle"
            fontFamily="ZCOOL XiaoWei, serif"
            fontSize="180"
            fill="#e7c773"
            opacity="0.18">史</text>

      <g fill="#ffe2a3">
        <circle cx="80" cy="200" r="1.2" opacity="0.9"/>
        <circle cx="300" cy="180" r="1.5" opacity="0.7"/>
        <circle cx="120" cy="280" r="1" opacity="0.8"/>
        <circle cx="260" cy="260" r="1.6" opacity="0.6"/>
        <circle cx="200" cy="120" r="1" opacity="0.5"/>
        <circle cx="340" cy="240" r="1.2" opacity="0.7"/>
        <circle cx="60" cy="380" r="1" opacity="0.5"/>
      </g>
    </svg>
  );
}

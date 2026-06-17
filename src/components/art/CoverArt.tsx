export function CoverArt() {
  return (
    <svg viewBox="0 0 390 780" xmlns="http://www.w3.org/2000/svg"
      style={{width:"100%", height:"100%", display:"block"}}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* night sky: cool deep blue up top warming into ink at the horizon */}
        <linearGradient id="cv-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0c1422"/>
          <stop offset="42%" stopColor="#100c10"/>
          <stop offset="72%" stopColor="#0d0805"/>
          <stop offset="100%" stopColor="#080503"/>
        </linearGradient>
        <radialGradient id="cv-moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.85"/>
          <stop offset="38%" stopColor="#e7b653" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#e7b653" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="cv-moonBody" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#fff6dc"/>
          <stop offset="70%" stopColor="#f0deb0"/>
          <stop offset="100%" stopColor="#d9bd84"/>
        </radialGradient>
        <radialGradient id="cv-ridge" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="#e08a36" stopOpacity="0.34"/>
          <stop offset="45%" stopColor="#b23a2c" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#b23a2c" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="cv-mist" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#cdbb90" stopOpacity="0"/>
          <stop offset="50%" stopColor="#cdbb90" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#cdbb90" stopOpacity="0"/>
        </linearGradient>
      </defs>

      <rect width="390" height="780" fill="url(#cv-sky)"/>

      {/* large faint 史 watermark seated behind the moon */}
      <text x="195" y="468" textAnchor="middle"
            fontFamily="var(--font-han)" fontSize="280"
            fill="#ecdca6" opacity="0.05">史</text>

      {/* moon + halo, seated in the open band between subtitle and synopsis */}
      <g transform="translate(160 332)">
        <ellipse cx="0" cy="0" rx="126" ry="126" fill="url(#cv-moonGlow)"/>
        <circle cx="0" cy="0" r="46" fill="url(#cv-moonBody)"/>
        {/* soft craters */}
        <circle cx="-14" cy="-10" r="7" fill="#cfb079" opacity="0.4"/>
        <circle cx="12" cy="8" r="10" fill="#cfb079" opacity="0.3"/>
        <circle cx="6" cy="-18" r="4" fill="#cfb079" opacity="0.3"/>
      </g>

      {/* celestial compass rings — the time-space / 青史 motif */}
      <g transform="translate(195 332)" fill="none" stroke="#ecdca6">
        <circle r="150" strokeWidth="0.5" opacity="0.16"/>
        <circle r="118" strokeWidth="0.5" opacity="0.32" strokeDasharray="2 7"/>
        <circle r="90" strokeWidth="0.5" opacity="0.2"/>
      </g>

      {/* a few distant birds, tucked into the upper-right sky */}
      <g stroke="#d8c79a" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5">
        <path d="M286 150 q7 -6 14 0 q7 -6 14 0"/>
        <path d="M320 134 q5 -4 10 0 q5 -4 10 0"/>
        <path d="M300 176 q5 -4 10 0 q5 -4 10 0"/>
      </g>

      {/* warm glow sitting just behind the ridge line */}
      <ellipse cx="225" cy="600" rx="230" ry="120" fill="url(#cv-ridge)"/>

      {/* layered ink mountains — back (lit) to front (dark) */}
      <path d="M0 612 L46 566 L96 600 L156 548 L214 592 L276 542 L336 584 L390 556 L390 780 L0 780 Z"
            fill="#241a12" opacity="0.96"/>
      <rect x="0" y="588" width="390" height="34" fill="url(#cv-mist)"/>
      <path d="M0 664 L62 626 L132 662 L202 620 L262 658 L330 624 L390 652 L390 780 L0 780 Z"
            fill="#150d08"/>
      <rect x="0" y="648" width="390" height="30" fill="url(#cv-mist)" opacity="0.8"/>
      <path d="M0 716 L74 688 L162 712 L244 684 L322 710 L390 692 L390 780 L0 780 Z"
            fill="#06090b"/>

      {/* lone pavilion silhouette on the near ridge */}
      <g transform="translate(286 690)" fill="#06090b" stroke="#3a2a14" strokeWidth="0.6">
        <path d="M-22 6 L0 -10 L22 6 Z" fill="#120b07"/>
        <rect x="-15" y="6" width="30" height="18" fill="#0c0705"/>
        <line x1="-26" y1="6" x2="26" y2="6" stroke="#5a4424" strokeWidth="1" opacity="0.6"/>
      </g>
    </svg>
  );
}

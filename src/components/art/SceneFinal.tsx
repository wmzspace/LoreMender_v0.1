export function SceneFinal() {
  return (
    <svg viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <radialGradient id="fg-c" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#ffd081" stopOpacity="0.7"/>
          <stop offset="60%" stopColor="#d97a2b" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#06090b" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="fg-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e2d0"/>
          <stop offset="1" stopColor="#c5a06a"/>
        </linearGradient>
      </defs>
      <rect width="390" height="280" fill="#06090b"/>
      <ellipse cx="195" cy="140" rx="180" ry="120" fill="url(#fg-c)"/>

      <g transform="translate(70 80)">
        <rect x="-12" y="-6" width="12" height="130" fill="#7c7358"/>
        <rect x="0" y="0" width="250" height="120" fill="url(#fg-paper)"/>
        <rect x="250" y="-6" width="12" height="130" fill="#7c7358"/>
        <g stroke="#3a2a14" strokeWidth="0.6" opacity="0.5">
          {[16,30,44,58,72,86,100].map(y =>
            <line key={y} x1="14" y1={y} x2="236" y2={y}/>
          )}
        </g>
        <rect x="200" y="68" width="36" height="36" fill="#b23a2c" opacity="0.92"/>
        <text x="218" y="93" textAnchor="middle" fontFamily="var(--font-han)"
              fontSize="22" fill="#fbe3c2">青</text>
      </g>

      <g transform="translate(60 70)">
        <rect x="-3" y="-30" width="6" height="30" fill="#e9e2d0"/>
        <path d="M0 -50 C-4 -42 -4 -34 0 -32 C4 -34 4 -42 0 -50 Z" fill="#ffd081"/>
        <circle cx="0" cy="-40" r="30" fill="url(#fg-c)" opacity="0.6"/>
      </g>
    </svg>
  );
}

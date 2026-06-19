export function SceneTrust() {
  return (
    <svg viewBox="0 0 390 200" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <linearGradient id="tg-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1014"/>
          <stop offset="1" stopColor="#06090b"/>
        </linearGradient>
        <radialGradient id="tg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ecdca6" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#06090b" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="200" fill="url(#tg-bg)"/>
      <ellipse cx="195" cy="100" rx="200" ry="80" fill="url(#tg-glow)" opacity="0.6"/>

      {[60, 150, 240, 330].map((x, i) => (
        <g key={i} transform={`translate(${x} 40)`} opacity="0.5">
          <ellipse cx="0" cy="0" rx="14" ry="14" fill="#1a0f08"/>
          <path d="M-22 16 L-26 100 L-10 100 L-6 38 L0 100 L6 100 L10 38 L26 100 L22 16 Z" fill="#1a0f08"/>
        </g>
      ))}

      <text x="195" y="150" textAnchor="middle"
            fontFamily="var(--font-han)"
            fontSize="120"
            fill="#ecdca6"
            opacity="0.08">托</text>
    </svg>
  );
}

export function SceneClinic() {
  return (
    <svg viewBox="0 0 390 280" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <radialGradient id="sg-candle" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#ffd081" stopOpacity="0.7"/>
          <stop offset="55%" stopColor="#d97a2b" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#0b0805" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="sg-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1a0c"/>
          <stop offset="1" stopColor="#170d05"/>
        </linearGradient>
        <linearGradient id="sg-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2516"/>
          <stop offset="1" stopColor="#1f130a"/>
        </linearGradient>
        <pattern id="sg-cab-grid" x="0" y="0" width="36" height="40" patternUnits="userSpaceOnUse">
          <rect width="36" height="40" fill="url(#sg-cab)"/>
          <rect x="2" y="2" width="32" height="36" fill="none" stroke="#5a3a20" strokeWidth="1.2"/>
          <circle cx="18" cy="20" r="1.6" fill="#ecdca6" opacity="0.7"/>
        </pattern>
      </defs>

      <rect width="390" height="280" fill="url(#sg-wood)"/>

      <g transform="translate(220 30)">
        <rect width="170" height="220" fill="url(#sg-cab-grid)"/>
        <rect width="170" height="220" fill="none" stroke="#06090b" strokeWidth="1"/>
        <g stroke="#7a5a30" strokeWidth="1" fill="none" opacity="0.6">
          <path d="M20 -5 L20 18"/>
          <path d="M60 -5 L60 22"/>
          <path d="M100 -5 L100 16"/>
          <path d="M140 -5 L140 20"/>
        </g>
      </g>

      <g transform="translate(20 30)">
        <rect width="120" height="140" fill="#0a1018" opacity="0.95"/>
        <rect width="120" height="140" fill="none" stroke="#5a3a20" strokeWidth="2"/>
        <line x1="60" y1="0" x2="60" y2="140" stroke="#5a3a20" strokeWidth="1.5"/>
        <line x1="0" y1="70" x2="120" y2="70" stroke="#5a3a20" strokeWidth="1.5"/>
        <g stroke="#8aa2c2" strokeWidth="0.6" opacity="0.4">
          <line x1="10" y1="10" x2="6" y2="40"/>
          <line x1="25" y1="20" x2="21" y2="50"/>
          <line x1="40" y1="5" x2="36" y2="40"/>
          <line x1="55" y1="15" x2="51" y2="50"/>
          <line x1="75" y1="10" x2="71" y2="50"/>
          <line x1="90" y1="25" x2="86" y2="60"/>
          <line x1="105" y1="5" x2="101" y2="35"/>
          <line x1="20" y1="80" x2="16" y2="115"/>
          <line x1="50" y1="90" x2="46" y2="125"/>
          <line x1="80" y1="85" x2="76" y2="120"/>
          <line x1="100" y1="100" x2="96" y2="130"/>
        </g>
        <circle cx="90" cy="35" r="20" fill="#ffe2a3" opacity="0.18"/>
      </g>

      <rect x="20" y="200" width="350" height="14" fill="#3a2516"/>
      <rect x="20" y="214" width="350" height="6" fill="#1a0f08"/>

      <g transform="translate(80 178)">
        <rect x="0" y="0" width="160" height="26" fill="#e3dcc7" opacity="0.92"/>
        <g stroke="#3a2a14" strokeWidth="0.5" opacity="0.55">
          <line x1="6" y1="6" x2="154" y2="6"/>
          <line x1="6" y1="12" x2="148" y2="12"/>
          <line x1="6" y1="18" x2="150" y2="18"/>
        </g>
        <rect x="-6" y="-3" width="6" height="32" fill="#7c7358"/>
        <rect x="160" y="-3" width="6" height="32" fill="#7c7358"/>
        <rect x="130" y="3" width="14" height="14" fill="#b23a2c" opacity="0.9"/>
      </g>

      <g transform="translate(195 130)">
        <ellipse cx="0" cy="80" rx="70" ry="14" fill="url(#sg-candle)"/>
        <rect x="-4" y="40" width="8" height="40" fill="#e9e2d0"/>
        <rect x="-6" y="38" width="12" height="4" fill="#cdb277"/>
        <path d="M0 20 C-6 32 -6 44 0 48 C6 44 6 32 0 20 Z" fill="#ffd081">
          <animateTransform attributeName="transform" type="scale" values="1 1; 1 1.05; 1 1" dur="1.6s" repeatCount="indefinite"/>
        </path>
        <path d="M0 26 C-3 34 -3 42 0 44 C3 42 3 34 0 26 Z" fill="#fff3d0"/>
        <circle cx="0" cy="34" r="60" fill="url(#sg-candle)" opacity="0.55"/>
      </g>

      <rect width="390" height="280" fill="url(#sg-candle)" opacity="0.5" style={{mixBlendMode:"screen"}}/>
    </svg>
  );
}

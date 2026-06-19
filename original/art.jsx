/* ============================================================
   art.jsx — SVG scene illustrations & character silhouettes
   All ink/gold/candlelight 古风 vibe.
   ============================================================ */

// ---- Goldfish-dust particles ----
function Particles({ count = 14 }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = (Math.random() * 8).toFixed(2);
    const dur = (8 + Math.random() * 10).toFixed(2);
    const size = (2 + Math.random() * 3).toFixed(1);
    dots.push(
      <span key={i} style={{
        left: left + "%", top: top + "%",
        width: size + "px", height: size + "px",
        animationDelay: `-${delay}s`,
        animationDuration: `${dur}s`,
      }}/>
    );
  }
  return <div className="particles">{dots}</div>;
}

// ============================================================
// COVER ART — 青史空间入口
// ============================================================
function CoverArt() {
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

      {/* Deep night base */}
      <rect width="390" height="520" fill="#0b0805"/>

      {/* Distant mountains silhouette */}
      <path d="M0 380 L60 320 L120 360 L180 300 L240 350 L300 290 L390 340 L390 520 L0 520 Z"
            fill="#120b08" opacity="0.85"/>
      <path d="M0 420 L70 380 L140 410 L220 370 L300 405 L390 380 L390 520 L0 520 Z"
            fill="#1a0f08" opacity="0.85"/>

      {/* Big aura — 青史空间 gateway */}
      <ellipse cx="195" cy="220" rx="220" ry="200" fill="url(#cg1)"/>
      <ellipse cx="195" cy="210" rx="120" ry="120" fill="url(#cg2)"/>

      {/* Concentric ring of glyphs (ancient text feel) */}
      <g opacity="0.55" transform="translate(195 215)">
        <circle r="110" fill="none" stroke="#e7c773" strokeWidth="0.5" opacity="0.5"/>
        <circle r="86" fill="none" stroke="#e7c773" strokeWidth="0.5" opacity="0.7" strokeDasharray="2 6"/>
        <circle r="58" fill="none" stroke="#e7c773" strokeWidth="0.5" opacity="0.6"/>
      </g>

      {/* Center vertical glow (gateway) */}
      <rect x="186" y="80" width="18" height="280" fill="url(#cg2)" filter="url(#blur1)" opacity="0.7"/>

      {/* Floating scroll fragments */}
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

      {/* Central vertical Chinese character 史 (history) — large faded mark */}
      <text x="195" y="260" textAnchor="middle"
            fontFamily="ZCOOL XiaoWei, serif"
            fontSize="180"
            fill="#e7c773"
            opacity="0.18">史</text>

      {/* Gold flecks */}
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

// ============================================================
// SCENE: Clinic at night — 医馆夜谈
// ============================================================
function SceneClinic() {
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
          <circle cx="18" cy="20" r="1.6" fill="#e7c773" opacity="0.7"/>
        </pattern>
      </defs>

      {/* Wall (dark wood) */}
      <rect width="390" height="280" fill="url(#sg-wood)"/>

      {/* Medicine cabinet at right */}
      <g transform="translate(220 30)">
        <rect width="170" height="220" fill="url(#sg-cab-grid)"/>
        <rect width="170" height="220" fill="none" stroke="#0a0604" strokeWidth="1"/>
        {/* hanging dried herbs over cabinet top */}
        <g stroke="#7a5a30" strokeWidth="1" fill="none" opacity="0.6">
          <path d="M20 -5 L20 18"/>
          <path d="M60 -5 L60 22"/>
          <path d="M100 -5 L100 16"/>
          <path d="M140 -5 L140 20"/>
        </g>
      </g>

      {/* Window with rain on left */}
      <g transform="translate(20 30)">
        <rect width="120" height="140" fill="#0a1018" opacity="0.95"/>
        <rect width="120" height="140" fill="none" stroke="#5a3a20" strokeWidth="2"/>
        <line x1="60" y1="0" x2="60" y2="140" stroke="#5a3a20" strokeWidth="1.5"/>
        <line x1="0" y1="70" x2="120" y2="70" stroke="#5a3a20" strokeWidth="1.5"/>
        {/* rain streaks */}
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
        {/* distant moon glow */}
        <circle cx="90" cy="35" r="20" fill="#ffe2a3" opacity="0.18"/>
      </g>

      {/* Table */}
      <rect x="20" y="200" width="350" height="14" fill="#3a2516"/>
      <rect x="20" y="214" width="350" height="6" fill="#1a0f08"/>

      {/* Open scroll on table */}
      <g transform="translate(80 178)">
        <rect x="0" y="0" width="160" height="26" fill="#e9d4a6" opacity="0.92"/>
        <g stroke="#3a2a14" strokeWidth="0.5" opacity="0.55">
          <line x1="6" y1="6" x2="154" y2="6"/>
          <line x1="6" y1="12" x2="148" y2="12"/>
          <line x1="6" y1="18" x2="150" y2="18"/>
        </g>
        {/* roller ends */}
        <rect x="-6" y="-3" width="6" height="32" fill="#8a6e3f"/>
        <rect x="160" y="-3" width="6" height="32" fill="#8a6e3f"/>
        {/* small red seal */}
        <rect x="130" y="3" width="14" height="14" fill="#a8311f" opacity="0.9"/>
      </g>

      {/* Candle in center */}
      <g transform="translate(195 130)">
        <ellipse cx="0" cy="80" rx="70" ry="14" fill="url(#sg-candle)"/>
        <rect x="-4" y="40" width="8" height="40" fill="#f0dcae"/>
        <rect x="-6" y="38" width="12" height="4" fill="#c9a14a"/>
        {/* flame */}
        <path d="M0 20 C-6 32 -6 44 0 48 C6 44 6 32 0 20 Z" fill="#ffd081">
          <animateTransform attributeName="transform" type="scale" values="1 1; 1 1.05; 1 1" dur="1.6s" repeatCount="indefinite"/>
        </path>
        <path d="M0 26 C-3 34 -3 42 0 44 C3 42 3 34 0 26 Z" fill="#fff3d0"/>
        {/* glow */}
        <circle cx="0" cy="34" r="60" fill="url(#sg-candle)" opacity="0.55"/>
      </g>

      {/* Atmospheric vignette */}
      <rect width="390" height="280" fill="url(#sg-candle)" opacity="0.5" style={{mixBlendMode:"screen"}}/>
    </svg>
  );
}

// ============================================================
// SCENE: Officials' raid approaching
// ============================================================
function SceneRaid() {
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

      {/* Wet stone street */}
      <rect y="190" width="390" height="90" fill="#0d0a07"/>
      <g opacity="0.4">
        <line x1="0" y1="200" x2="390" y2="200" stroke="#3a2516"/>
        <line x1="0" y1="220" x2="390" y2="220" stroke="#3a2516"/>
        <line x1="0" y1="240" x2="390" y2="240" stroke="#3a2516"/>
        <line x1="0" y1="260" x2="390" y2="260" stroke="#3a2516"/>
      </g>
      {/* puddle reflections */}
      <ellipse cx="160" cy="240" rx="60" ry="6" fill="#3a4a5a" opacity="0.3"/>
      <ellipse cx="300" cy="252" rx="40" ry="4" fill="#3a4a5a" opacity="0.25"/>

      {/* Buildings receding */}
      <g>
        <rect x="0" y="60" width="80" height="140" fill="#150c07"/>
        <rect x="80" y="90" width="60" height="110" fill="#1c1108"/>
        <rect x="290" y="50" width="100" height="150" fill="#120a06"/>
        <rect x="240" y="85" width="60" height="115" fill="#1a0f07"/>
        {/* eaves */}
        <path d="M0 60 L80 60 L75 50 L5 50 Z" fill="#0a0604"/>
        <path d="M290 50 L390 50 L385 40 L295 40 Z" fill="#0a0604"/>
      </g>

      {/* lanterns hanging */}
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

      {/* Two distant guards silhouettes with spears */}
      <g fill="#0a0604" transform="translate(180 130)">
        <ellipse cx="0" cy="0" rx="9" ry="9"/>
        <path d="M-12 6 L-10 60 L-3 60 L0 26 L3 60 L10 60 L12 6 Z"/>
        <line x1="-18" y1="-10" x2="-18" y2="50" stroke="#0a0604" strokeWidth="2"/>
        <path d="M-22 -16 L-14 -16 L-14 -8 L-22 -8 Z" fill="#1a0f08"/>
      </g>
      <g fill="#0a0604" transform="translate(210 132)">
        <ellipse cx="0" cy="0" rx="9" ry="9"/>
        <path d="M-12 6 L-10 60 L-3 60 L0 26 L3 60 L10 60 L12 6 Z"/>
        <line x1="14" y1="-10" x2="14" y2="50" stroke="#0a0604" strokeWidth="2"/>
        <path d="M10 -16 L18 -16 L18 -8 L10 -8 Z" fill="#1a0f08"/>
      </g>

      {/* Mist */}
      <ellipse cx="195" cy="200" rx="220" ry="22" fill="#aaa899" opacity="0.08"/>
    </svg>
  );
}

// ============================================================
// SCENE: Trust people lineup
// ============================================================
function SceneTrust() {
  return (
    <svg viewBox="0 0 390 200" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <linearGradient id="tg-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a120b"/>
          <stop offset="1" stopColor="#0a0604"/>
        </linearGradient>
        <radialGradient id="tg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e7c773" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#0a0604" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="200" fill="url(#tg-bg)"/>
      <ellipse cx="195" cy="100" rx="200" ry="80" fill="url(#tg-glow)" opacity="0.6"/>

      {/* Four shadow figures in a row */}
      {[60, 150, 240, 330].map((x, i) => (
        <g key={i} transform={`translate(${x} 40)`} opacity="0.5">
          <ellipse cx="0" cy="0" rx="14" ry="14" fill="#1a0f08"/>
          <path d="M-22 16 L-26 100 L-10 100 L-6 38 L0 100 L6 100 L10 38 L26 100 L22 16 Z" fill="#1a0f08"/>
        </g>
      ))}

      {/* Floating ink character */}
      <text x="195" y="150" textAnchor="middle"
            fontFamily="ZCOOL XiaoWei, serif"
            fontSize="120"
            fill="#e7c773"
            opacity="0.08">托</text>
    </svg>
  );
}

// ============================================================
// SCENE: Final choice — scroll under candle
// ============================================================
function SceneFinal() {
  return (
    <svg viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%", display:"block"}}>
      <defs>
        <radialGradient id="fg-c" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#ffd081" stopOpacity="0.7"/>
          <stop offset="60%" stopColor="#d97a2b" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#0a0604" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="fg-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0dcae"/>
          <stop offset="1" stopColor="#c5a06a"/>
        </linearGradient>
      </defs>
      <rect width="390" height="280" fill="#0a0604"/>
      <ellipse cx="195" cy="140" rx="180" ry="120" fill="url(#fg-c)"/>

      {/* Open large scroll center */}
      <g transform="translate(70 80)">
        <rect x="-12" y="-6" width="12" height="130" fill="#8a6e3f"/>
        <rect x="0" y="0" width="250" height="120" fill="url(#fg-paper)"/>
        <rect x="250" y="-6" width="12" height="130" fill="#8a6e3f"/>
        {/* faded text lines */}
        <g stroke="#3a2a14" strokeWidth="0.6" opacity="0.5">
          {[16,30,44,58,72,86,100].map(y =>
            <line key={y} x1="14" y1={y} x2="236" y2={y}/>
          )}
        </g>
        {/* big red 青 seal */}
        <rect x="200" y="68" width="36" height="36" fill="#a8311f" opacity="0.92"/>
        <text x="218" y="93" textAnchor="middle" fontFamily="ZCOOL XiaoWei, serif"
              fontSize="22" fill="#fbe3c2">青</text>
      </g>

      {/* small candle behind scroll */}
      <g transform="translate(60 70)">
        <rect x="-3" y="-30" width="6" height="30" fill="#f0dcae"/>
        <path d="M0 -50 C-4 -42 -4 -34 0 -32 C4 -34 4 -42 0 -50 Z" fill="#ffd081"/>
        <circle cx="0" cy="-40" r="30" fill="url(#fg-c)" opacity="0.6"/>
      </g>
    </svg>
  );
}

// ============================================================
// SCENE: Ending illustrations
// ============================================================
function SceneEndingAsh() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%"}}>
      <defs>
        <radialGradient id="ea" cx="50%" cy="62%" r="55%">
          <stop offset="0%" stopColor="#ff8b3a" stopOpacity="0.85"/>
          <stop offset="40%" stopColor="#c93a14" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#0a0604" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="320" fill="#0a0604"/>
      <ellipse cx="195" cy="220" rx="220" ry="160" fill="url(#ea)"/>

      {/* Charred scroll falling apart */}
      <g transform="translate(110 130)">
        <path d="M0 20 L170 30 L165 90 L5 80 Z" fill="#2a1208"/>
        <path d="M10 25 L160 35 L156 84 L14 76 Z" fill="#3a1a0c"/>
        <g stroke="#e9b86c" opacity="0.6">
          <path d="M14 30 L24 38 L18 50 L30 56 L22 70 L40 76" fill="none"/>
        </g>
        {/* embers */}
        {[[20,10],[60,5],[100,15],[140,8],[170,20],[40,90],[110,95]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={1.5+Math.random()*1.5} fill="#ffb968" opacity={0.5+Math.random()*0.5}/>
        ))}
      </g>

      {/* Floating embers */}
      {Array.from({length:14}).map((_,i)=>(
        <circle key={i} cx={30+Math.random()*330} cy={50+Math.random()*200}
                r={1+Math.random()*2} fill="#ffd081" opacity={0.4+Math.random()*0.5}/>
      ))}

      {/* faded character 焚 */}
      <text x="195" y="220" textAnchor="middle" fontFamily="ZCOOL XiaoWei, serif"
            fontSize="160" fill="#3a1208" opacity="0.6">焚</text>
    </svg>
  );
}

function SceneEndingSealed() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%"}}>
      <defs>
        <linearGradient id="es" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1208"/>
          <stop offset="1" stopColor="#0a0604"/>
        </linearGradient>
      </defs>
      <rect width="390" height="320" fill="url(#es)"/>

      {/* Brick wall with hidden compartment */}
      <g>
        {Array.from({length:6}).map((_,r)=>(
          <g key={r}>
            {Array.from({length:7}).map((_,c)=>{
              const xoff = r%2 ? 25 : 0;
              return <rect key={c} x={20+xoff+c*52} y={50+r*40} width="48" height="36"
                fill="#3a2516" stroke="#1a0f08" strokeWidth="2"/>
            })}
          </g>
        ))}
      </g>

      {/* glowing compartment */}
      <g transform="translate(150 130)">
        <rect width="90" height="60" fill="#1a0f08" stroke="#c9a14a" strokeWidth="1.5"/>
        <rect x="10" y="10" width="70" height="40" fill="#3a2516"/>
        {/* tiny scroll inside */}
        <g transform="translate(25 22)">
          <rect width="40" height="16" fill="#c5a06a"/>
          <line x1="0" y1="0" x2="0" y2="16" stroke="#8a6e3f" strokeWidth="3"/>
          <line x1="40" y1="0" x2="40" y2="16" stroke="#8a6e3f" strokeWidth="3"/>
        </g>
        <circle cx="45" cy="30" r="60" fill="#e7c773" opacity="0.08"/>
      </g>

      {/* Dust motes */}
      {Array.from({length:18}).map((_,i)=>(
        <circle key={i} cx={Math.random()*390} cy={Math.random()*320}
                r={0.6+Math.random()*1} fill="#c5a06a" opacity={0.3+Math.random()*0.4}/>
      ))}

      <text x="195" y="220" textAnchor="middle" fontFamily="ZCOOL XiaoWei, serif"
            fontSize="160" fill="#5a4520" opacity="0.16">封</text>
    </svg>
  );
}

function SceneEndingLiving() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%"}}>
      <defs>
        <radialGradient id="el" cx="50%" cy="60%" r="55%">
          <stop offset="0" stopColor="#ffd081" stopOpacity="0.5"/>
          <stop offset="0.5" stopColor="#c9a14a" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#0a0604" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="el2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2418"/>
          <stop offset="1" stopColor="#0a0e08"/>
        </linearGradient>
      </defs>
      <rect width="390" height="320" fill="url(#el2)"/>
      <ellipse cx="195" cy="220" rx="220" ry="140" fill="url(#el)"/>

      {/* Rolling hills */}
      <path d="M0 240 Q90 200 180 230 T390 220 L390 320 L0 320 Z" fill="#162216" opacity="0.9"/>
      <path d="M0 270 Q120 240 240 265 T390 255 L390 320 L0 320 Z" fill="#0e1a0e" opacity="0.95"/>

      {/* Small lanterns / fireflies scattered (representing knowledge living on) */}
      {[[60,180],[110,210],[170,160],[220,200],[280,170],[330,210],
        [90,150],[200,140],[300,140],[150,230],[250,240]].map(([x,y],i)=>(
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="3" fill="#ffd081"/>
          <circle r="8" fill="#ffd081" opacity="0.3"/>
          <circle r="14" fill="#ffd081" opacity="0.12"/>
        </g>
      ))}

      {/* Tree silhouette */}
      <g transform="translate(40 130)">
        <rect x="-3" y="60" width="6" height="80" fill="#0a0604"/>
        <circle cx="0" cy="50" r="40" fill="#0a0604"/>
        <circle cx="-20" cy="35" r="22" fill="#0a0604"/>
        <circle cx="20" cy="35" r="22" fill="#0a0604"/>
      </g>
      <g transform="translate(345 110)">
        <rect x="-3" y="70" width="6" height="80" fill="#0a0604"/>
        <circle cx="0" cy="55" r="45" fill="#0a0604"/>
      </g>

      <text x="195" y="220" textAnchor="middle" fontFamily="ZCOOL XiaoWei, serif"
            fontSize="160" fill="#3a5238" opacity="0.18">传</text>
    </svg>
  );
}

// ============================================================
// Character silhouette portraits — used in trust selection
// ============================================================
function CharSilhouette({ kind, accent = "#c9a14a" }) {
  const common = (
    <defs>
      <radialGradient id={`cs-${kind}`} cx="50%" cy="40%" r="60%">
        <stop offset="0" stopColor={accent} stopOpacity="0.35"/>
        <stop offset="1" stopColor="#0a0604" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={`csb-${kind}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a1208"/>
        <stop offset="1" stopColor="#0a0604"/>
      </linearGradient>
    </defs>
  );

  let figure;
  if (kind === "scholar") {
    figure = (
      <g fill="#0a0604" stroke={accent} strokeWidth="0.6" opacity="0.95">
        {/* scholar with cap */}
        <path d="M65 30 Q65 18 80 18 Q95 18 95 30 L93 36 L67 36 Z"/>
        <ellipse cx="80" cy="46" rx="13" ry="14"/>
        <path d="M50 100 Q80 60 110 100 L100 160 L60 160 Z"/>
        <line x1="80" y1="64" x2="80" y2="160" strokeWidth="0.6" opacity="0.5"/>
      </g>
    );
  } else if (kind === "rugged") {
    figure = (
      <g fill="#0a0604" stroke={accent} strokeWidth="0.6" opacity="0.95">
        {/* burly bonesetter, head wrap */}
        <path d="M64 30 Q64 18 80 18 Q96 18 96 30 L94 38 L66 38 Z"/>
        <ellipse cx="80" cy="48" rx="15" ry="14"/>
        <path d="M44 100 Q80 65 116 100 L108 160 L52 160 Z"/>
        {/* sash */}
        <path d="M52 110 L108 110 L106 118 L54 118 Z" fill={accent} opacity="0.5"/>
      </g>
    );
  } else if (kind === "songbird") {
    figure = (
      <g fill="#0a0604" stroke={accent} strokeWidth="0.6" opacity="0.95">
        {/* long hair singer with hairpin */}
        <path d="M58 50 Q60 22 80 22 Q100 22 102 50 Q102 70 80 60 Q58 70 58 50 Z"/>
        <ellipse cx="80" cy="50" rx="12" ry="14"/>
        <path d="M50 100 Q80 72 110 100 L116 160 L44 160 Z"/>
        {/* hairpin */}
        <line x1="92" y1="32" x2="100" y2="22" stroke={accent} strokeWidth="1.4"/>
        <circle cx="100" cy="22" r="1.6" fill={accent}/>
      </g>
    );
  } else { // elder
    figure = (
      <g fill="#0a0604" stroke={accent} strokeWidth="0.6" opacity="0.95">
        {/* older bearded man */}
        <ellipse cx="80" cy="44" rx="13" ry="14"/>
        <path d="M68 38 Q74 28 80 28 Q86 28 92 38 L92 32 Q86 24 80 24 Q74 24 68 32 Z"/>
        {/* beard */}
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

// ============================================================
// Clue icons — small SVGs for each clue card
// ============================================================
function ClueIcon({ type, size = 56 }) {
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
      {/* needle */}
      <line x1="44" y1="10" x2="20" y2="34" stroke="#c9a14a" strokeWidth="0.8"/>
      <circle cx="44" cy="10" r="1.6" fill="#c9a14a"/>
    </svg>
  );
  return null;
}

// ============================================================
// World icons (4 setting cards)
// ============================================================
function WorldIcon({ type }) {
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
      {/* needle stitching */}
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

Object.assign(window, {
  Particles, CoverArt,
  SceneClinic, SceneRaid, SceneTrust, SceneFinal,
  SceneEndingAsh, SceneEndingSealed, SceneEndingLiving,
  CharSilhouette, ClueIcon, WorldIcon,
});

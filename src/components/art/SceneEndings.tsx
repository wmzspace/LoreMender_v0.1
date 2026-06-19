export function SceneEndingAsh() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%"}}>
      <defs>
        <radialGradient id="ea" cx="50%" cy="62%" r="55%">
          <stop offset="0%" stopColor="#ff8b3a" stopOpacity="0.85"/>
          <stop offset="40%" stopColor="#c93a14" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#06090b" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="320" fill="#06090b"/>
      <ellipse cx="195" cy="220" rx="220" ry="160" fill="url(#ea)"/>

      <g transform="translate(110 130)">
        <path d="M0 20 L170 30 L165 90 L5 80 Z" fill="#2a1208"/>
        <path d="M10 25 L160 35 L156 84 L14 76 Z" fill="#3a1a0c"/>
        <g stroke="#e9b86c" opacity="0.6">
          <path d="M14 30 L24 38 L18 50 L30 56 L22 70 L40 76" fill="none"/>
        </g>
        {([[20,10],[60,5],[100,15],[140,8],[170,20],[40,90],[110,95]] as [number, number][]).map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={1.5+Math.random()*1.5} fill="#ffb968" opacity={0.5+Math.random()*0.5}/>
        ))}
      </g>

      {Array.from({length:14}).map((_,i)=>(
        <circle key={i} cx={30+Math.random()*330} cy={50+Math.random()*200}
                r={1+Math.random()*2} fill="#ffd081" opacity={0.4+Math.random()*0.5}/>
      ))}

      <text x="195" y="220" textAnchor="middle" fontFamily="var(--font-han)"
            fontSize="160" fill="#3a1208" opacity="0.6">焚</text>
    </svg>
  );
}

export function SceneEndingSealed() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%"}}>
      <defs>
        <linearGradient id="es" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1014"/>
          <stop offset="1" stopColor="#06090b"/>
        </linearGradient>
      </defs>
      <rect width="390" height="320" fill="url(#es)"/>

      <g>
        {Array.from({length:6}).map((_,r)=>(
          <g key={r}>
            {Array.from({length:7}).map((_,c)=>{
              const xoff = r%2 ? 25 : 0;
              return <rect key={c} x={20+xoff+c*52} y={50+r*40} width="48" height="36"
                fill="#3a2516" stroke="#1a0f08" strokeWidth="2"/>;
            })}
          </g>
        ))}
      </g>

      <g transform="translate(150 130)">
        <rect width="90" height="60" fill="#1a0f08" stroke="#cdb277" strokeWidth="1.5"/>
        <rect x="10" y="10" width="70" height="40" fill="#3a2516"/>
        <g transform="translate(25 22)">
          <rect width="40" height="16" fill="#c5a06a"/>
          <line x1="0" y1="0" x2="0" y2="16" stroke="#7c7358" strokeWidth="3"/>
          <line x1="40" y1="0" x2="40" y2="16" stroke="#7c7358" strokeWidth="3"/>
        </g>
        <circle cx="45" cy="30" r="60" fill="#ecdca6" opacity="0.08"/>
      </g>

      {Array.from({length:18}).map((_,i)=>(
        <circle key={i} cx={Math.random()*390} cy={Math.random()*320}
                r={0.6+Math.random()*1} fill="#c5a06a" opacity={0.3+Math.random()*0.4}/>
      ))}

      <text x="195" y="220" textAnchor="middle" fontFamily="var(--font-han)"
            fontSize="160" fill="#5a4520" opacity="0.16">封</text>
    </svg>
  );
}

export function SceneEndingLiving() {
  return (
    <svg viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice"
         style={{width:"100%", height:"100%"}}>
      <defs>
        <radialGradient id="el" cx="50%" cy="60%" r="55%">
          <stop offset="0" stopColor="#ffd081" stopOpacity="0.5"/>
          <stop offset="0.5" stopColor="#cdb277" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#06090b" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="el2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2418"/>
          <stop offset="1" stopColor="#0a0e08"/>
        </linearGradient>
      </defs>
      <rect width="390" height="320" fill="url(#el2)"/>
      <ellipse cx="195" cy="220" rx="220" ry="140" fill="url(#el)"/>

      <path d="M0 240 Q90 200 180 230 T390 220 L390 320 L0 320 Z" fill="#162216" opacity="0.9"/>
      <path d="M0 270 Q120 240 240 265 T390 255 L390 320 L0 320 Z" fill="#0e1a0e" opacity="0.95"/>

      {([[60,180],[110,210],[170,160],[220,200],[280,170],[330,210],
        [90,150],[200,140],[300,140],[150,230],[250,240]] as [number, number][]).map(([x,y],i)=>(
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="3" fill="#ffd081"/>
          <circle r="8" fill="#ffd081" opacity="0.3"/>
          <circle r="14" fill="#ffd081" opacity="0.12"/>
        </g>
      ))}

      <g transform="translate(40 130)">
        <rect x="-3" y="60" width="6" height="80" fill="#06090b"/>
        <circle cx="0" cy="50" r="40" fill="#06090b"/>
        <circle cx="-20" cy="35" r="22" fill="#06090b"/>
        <circle cx="20" cy="35" r="22" fill="#06090b"/>
      </g>
      <g transform="translate(345 110)">
        <rect x="-3" y="70" width="6" height="80" fill="#06090b"/>
        <circle cx="0" cy="55" r="45" fill="#06090b"/>
      </g>

      <text x="195" y="220" textAnchor="middle" fontFamily="var(--font-han)"
            fontSize="160" fill="#3a5238" opacity="0.18">传</text>
    </svg>
  );
}

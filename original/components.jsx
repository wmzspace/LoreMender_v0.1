/* ============================================================
   components.jsx — reusable UI atoms & molecules
   ============================================================ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------------- storage ----------------
const STORAGE_KEY = "loremender:huatuo:v1";
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) { return defaultState(); }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){}
}
function defaultState() {
  return {
    firstChoice: null,
    ch2: null,
    searchedClues: [],
    trustedPerson: null,
    finalDecision: null,
    currentChapter: 1,
    unlockedEndings: [],
    lastEnding: null,
  };
}

// ---------------- Toast ----------------
function Toast({ text, onDone }) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [text]);
  if (!text) return null;
  return <div className="toast">{text}</div>;
}

// ---------------- Topbar ----------------
function Topbar({ title, onBack, right }) {
  return (
    <div className="topbar">
      <button className="icon-btn press" onClick={onBack} aria-label="返回">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="topbar-title">{title}</div>
      <div style={{width: 38, display:"flex", justifyContent:"flex-end"}}>{right}</div>
    </div>
  );
}

// ---------------- Bottom Nav ----------------
const NAV_ITEMS = [
  { key: "story", label: "剧情" },
  { key: "clue",  label: "线索" },
  { key: "map",   label: "进程" },
  { key: "gallery", label: "图鉴" },
];
function BottomNav({ active, onNav }) {
  return (
    <div className="bottomnav">
      {NAV_ITEMS.map(it => (
        <button key={it.key}
          className={"navitem press " + (active === it.key ? "active" : "")}
          onClick={() => onNav(it.key)}>
          <span className="navdot"></span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------- Paper Panel ----------------
function PaperPanel({ children, style, className = "", torn = false }) {
  return (
    <div className={"paper-panel " + className}
         style={{padding: "16px 18px", ...style}}>
      {children}
    </div>
  );
}

// ---------------- Seal Tag ----------------
function SealTag({ children, size = "md", style }) {
  const cls = size === "lg" ? "seal seal-lg" : size === "sm" ? "seal seal-sm" : "seal";
  return <div className={cls} style={style}>{children}</div>;
}

// ---------------- Gold Divider ----------------
function GoldDivider({ label }) {
  return (
    <div className="gold-divider" style={{margin: "12px 0"}}>
      <span className="mark"></span>
      {label && <span style={{
        fontFamily: "ZCOOL XiaoWei, serif",
        fontSize: 13, letterSpacing: "0.3em", textIndent: "0.3em"
      }}>{label}</span>}
      <span className="mark"></span>
    </div>
  );
}

// ---------------- Dialogue Box ----------------
function DialogueBox({ speaker, text, isNarration, onTap }) {
  // typewriter effect
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, 26);
    return () => clearInterval(id);
  }, [text]);
  const onClick = () => {
    if (!done) { setShown(text); setDone(true); }
    else onTap && onTap();
  };
  return (
    <div className="dialogue press" onClick={onClick} style={{cursor:"pointer"}}>
      {speaker && !isNarration && (
        <div className="dialogue-name">{speaker}</div>
      )}
      <div className="dialogue-text" style={{
        whiteSpace: "pre-line",
        fontStyle: isNarration ? "italic" : "normal",
        color: isNarration ? "rgba(231,217,179,0.85)" : "var(--paper)",
      }}>
        {shown}
        {done && (
          <span style={{
            display: "inline-block", marginLeft: 6, color: "var(--gold-pale)",
            animation: "glowPulse 1.4s ease-in-out infinite",
          }}>▾</span>
        )}
      </div>
    </div>
  );
}

// ---------------- Choice Cards ----------------
function ChoiceList({ choices, onChoose }) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap: 10, padding:"12px 14px"}}>
      {choices.map((c, i) => (
        <button key={i} className="choice press" onClick={() => onChoose(c, i)}
                style={{animation: `fadeInUp 350ms ease both ${i*80+50}ms`}}>
          <span className="choice-letter">{String.fromCharCode(65+i)}</span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------- Character Card (trust select) ----------------
function CharacterCard({ char, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      className="press"
      style={{
        position: "relative",
        textAlign: "left", cursor: "pointer",
        background: selected
          ? "linear-gradient(180deg, rgba(231,199,115,0.18), rgba(40,30,18,0.7))"
          : "linear-gradient(180deg, rgba(30,22,14,0.9), rgba(15,10,6,0.9))",
        border: "1px solid " + (selected ? "var(--gold-pale)" : "rgba(201,161,74,0.35)"),
        borderRadius: 2,
        padding: 0,
        overflow: "hidden",
        boxShadow: selected
          ? "0 0 0 1px var(--gold-pale), 0 0 32px rgba(231,199,115,0.25)"
          : "0 4px 16px rgba(0,0,0,0.5)",
        color: "var(--paper)",
        transition: "all 220ms",
      }}>
      {/* Portrait area */}
      <div style={{position:"relative", height: 130, background:"#0a0604", overflow:"hidden"}}>
        <CharSilhouette kind={char.silhouette} accent={selected ? "#e7c773" : "#8c6b29"}/>
        <div style={{position:"absolute", top:8, right:8}}>
          <SealTag size="sm">{char.tag}</SealTag>
        </div>
      </div>
      {/* Name + role */}
      <div style={{padding: "10px 12px 12px"}}>
        <div style={{
          fontFamily: "ZCOOL XiaoWei, serif", fontSize: 15,
          letterSpacing: "0.16em",
          color: selected ? "var(--gold-pale)" : "var(--paper)",
        }}>{char.name}</div>
        <div style={{fontSize: 11, opacity: 0.7, marginTop: 3, letterSpacing: "0.1em"}}>
          {char.role}
        </div>
        <div style={{
          fontSize: 12.5, opacity: 0.85, marginTop: 8, lineHeight: 1.55,
          color: "rgba(231,217,179,0.85)",
        }}>{char.short}</div>
      </div>
      {selected && (
        <div style={{
          position:"absolute", inset: 0, pointerEvents:"none",
          boxShadow:"inset 0 0 30px rgba(231,199,115,0.15)",
        }}/>
      )}
    </button>
  );
}

// ---------------- Bottom Sheet ----------------
function BottomSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="sheet-backdrop" onClick={onClose}/>
      <div className="sheet">
        <div className="paper-panel" style={{
          margin: 0,
          borderRadius: "12px 12px 0 0",
          padding: "14px 18px 20px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}>
          <div style={{
            width: 40, height: 4, background: "rgba(78,58,20,0.4)",
            margin: "0 auto 12px", borderRadius: 2,
          }}/>
          {children}
        </div>
      </div>
    </React.Fragment>
  );
}

// ---------------- Progress Dots ----------------
function ProgressDots({ total, current }) {
  const items = [];
  for (let i = 0; i < total; i++) {
    const cls = i + 1 === current ? "dot active" : (i + 1 < current ? "dot done" : "dot");
    items.push(<span key={i} className={cls}/>);
  }
  return <div className="progress-dots">{items}</div>;
}

// ---------------- Scene Frame (wraps a scene illustration with overlays) ----------------
function SceneFrame({ children, height = 240 }) {
  return (
    <div style={{
      position:"relative", width:"100%", height,
      overflow: "hidden",
      background: "#0a0604",
    }}>
      {children}
      <div className="grain"/>
      <div className="vignette"/>
      <Particles count={10}/>
      {/* bottom fade into dialogue area */}
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, height: 60,
        background: "linear-gradient(180deg, transparent, rgba(10,6,4,0.95))",
        pointerEvents:"none",
      }}/>
    </div>
  );
}

// ---------------- Locked Chapter Card (other 副本) ----------------
function LockedDungeon({ title, subtitle }) {
  return (
    <div className="press" style={{
      position:"relative", height: 92, padding: "12px 14px",
      background: "linear-gradient(180deg, rgba(20,14,8,0.9), rgba(8,5,3,0.9))",
      border:"1px solid rgba(78,58,20,0.5)",
      borderRadius: 2,
      overflow:"hidden",
      display:"flex", alignItems:"center", gap: 12,
    }}>
      <div className="locked" style={{
        width: 64, height: 64, flexShrink: 0,
        background: "radial-gradient(circle at 50% 40%, #2a1e13, #0a0604)",
        borderRadius: 2,
      }}/>
      <div style={{flex: 1, opacity: 0.55}}>
        <div style={{fontFamily:"ZCOOL XiaoWei, serif", fontSize: 16, letterSpacing:"0.16em", color:"#8c6b29"}}>
          {title}
        </div>
        <div style={{fontSize: 11, opacity: 0.7, marginTop: 4, letterSpacing:"0.12em"}}>{subtitle}</div>
        <div style={{fontSize: 10, opacity: 0.6, marginTop: 6, color:"var(--vermillion)"}}>· 封 · 未启 ·</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  STORAGE_KEY, loadState, saveState, defaultState,
  Toast, Topbar, BottomNav, PaperPanel, SealTag, GoldDivider,
  DialogueBox, ChoiceList, CharacterCard, BottomSheet,
  ProgressDots, SceneFrame, LockedDungeon,
});

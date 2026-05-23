import { CoverArt, Particles } from "../components/art";

interface CoverPageProps {
  onStart: () => void;
  onWorld: () => void;
}

export function CoverPage({ onStart, onWorld }: CoverPageProps) {
  return (
    <div className="page night-deep-bg" style={{position:"relative"}}>
      <div style={{position:"absolute", inset: 0}}>
        <CoverArt/>
      </div>
      <Particles count={18}/>
      <div className="grain"/>
      <div className="vignette"/>

      <div style={{
        position:"relative", zIndex: 2,
        flex: 1, display:"flex", flexDirection:"column",
        padding: "calc(50px + env(safe-area-inset-top, 0px)) 28px calc(28px + var(--safe-bottom))",
      }}>
        <div className="ink-in" style={{textAlign:"center"}}>
          <div className="en-small" style={{fontSize: 11, color:"rgba(231,199,115,0.7)", marginBottom: 12}}>
            The Lore Mender
          </div>
        </div>

        <div className="fade-up" style={{textAlign:"center", animationDelay:"120ms"}}>
          <div className="title-han" style={{
            fontSize: 38, color:"var(--gold-pale)",
            letterSpacing: "0.32em", textIndent: "0.32em",
            textShadow: "0 0 24px rgba(231,199,115,0.5), 0 2px 4px rgba(0,0,0,0.8)",
            fontWeight: 500,
          }}>典故修补者</div>

          <div style={{
            display:"inline-flex", alignItems:"center", gap: 12,
            marginTop: 14, color:"var(--paper)",
          }}>
            <span style={{width:24, height:1, background:"var(--gold-pale)", opacity: 0.6}}/>
            <span className="title-han" style={{
              fontSize: 18, letterSpacing:"0.5em", textIndent:"0.5em",
              color:"var(--paper)", opacity: 0.95,
            }}>青囊残卷</span>
            <span style={{width:24, height:1, background:"var(--gold-pale)", opacity: 0.6}}/>
          </div>
        </div>

        <div style={{flex: 1, minHeight: 60}}/>

        <div className="fade-up" style={{
          textAlign:"center", marginBottom: 24,
          animationDelay:"400ms",
        }}>
          <div className="title-han" style={{
            fontSize: 14, color:"rgba(231,199,115,0.9)",
            letterSpacing:"0.5em", textIndent:"0.5em",
            marginBottom: 16,
          }}>穿越典故 · 修补遗憾</div>
          <div style={{
            fontSize: 12.5, lineHeight: 1.85, opacity: 0.78,
            maxWidth: 300, margin: "0 auto",
            color:"rgba(235,217,179,0.9)",
            letterSpacing: "0.06em",
          }}>
            你进入被遗忘的典故世界，附身关键人物，<br/>
            在无法改写命运的限制下，<br/>
            修补那些被历史掩埋的遗憾。
          </div>
        </div>

        <div className="fade-up" style={{
          display:"flex", flexDirection:"column", gap: 12,
          animationDelay:"600ms",
        }}>
          <button className="btn-primary press" onClick={onStart}>开 始 修 补</button>
          <button className="btn-ghost press" onClick={onWorld}>查 看 设 定</button>
        </div>

        <div style={{
          textAlign:"center", marginTop: 18,
          fontSize: 10, opacity: 0.4, letterSpacing:"0.4em",
        }}>建安二十五年 · 青史空间</div>
      </div>
    </div>
  );
}

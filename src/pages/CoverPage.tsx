interface CoverPageProps {
  onStart: () => void;
  onWorld: () => void;
}

export function CoverPage({ onStart, onWorld }: CoverPageProps) {
  return (
    <div className="page night-deep-bg">
      {/* key-art poster background (public/images/cover.jpg) */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url(/images/cover.jpg)",
        backgroundSize:"cover",
        backgroundPosition:"center top",
        backgroundColor:"#06090b",
      }}/>

      {/* bottom scrim so the buttons stay readable over the art */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"linear-gradient(180deg, transparent 42%, rgba(5,8,11,0.45) 64%, rgba(6,4,3,0.86) 82%, rgba(5,3,2,0.99) 100%)",
      }}/>

      {/* classical book-cover frame (题封) */}
      <div style={{
        position:"absolute", inset:"calc(14px + env(safe-area-inset-top,0px)) 14px calc(14px + var(--safe-bottom))",
        border:"1px solid rgba(205,178,119,0.32)", borderRadius:2,
        pointerEvents:"none", zIndex:3,
      }}/>
      <div style={{
        position:"absolute", inset:"calc(18px + env(safe-area-inset-top,0px)) 18px calc(18px + var(--safe-bottom))",
        border:"1px solid rgba(205,178,119,0.13)", borderRadius:2,
        pointerEvents:"none", zIndex:3,
      }}/>

      {/* actions pinned to the bottom */}
      <div style={{
        position:"relative", zIndex:2,
        flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end",
        padding:"0 28px calc(34px + var(--safe-bottom))",
      }}>
        <div className="fade-up" style={{
          display:"flex", flexDirection:"column", gap:12,
          animationDelay:"200ms",
        }}>
          <button className="btn-primary press" onClick={onStart}>开 始 修 补</button>
          <button className="btn-ghost press" onClick={onWorld}>查 看 设 定</button>
        </div>
      </div>
    </div>
  );
}

interface CoverPageProps {
  onStart: () => void;
  onWorld: () => void;
  onShowcase: () => void;
}

export function CoverPage({ onStart, onWorld, onShowcase }: CoverPageProps) {
  return (
    <div className="page night-deep-bg">
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url(/images/cover.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundColor: "#06090b",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 42%, rgba(5,8,11,0.45) 64%, rgba(6,4,3,0.86) 82%, rgba(5,3,2,0.99) 100%)",
      }} />

      <div className="grain" />
      <div className="vignette" />

      <div className="en-small fade-in" style={{
        position: "absolute",
        top: "calc(20px + env(safe-area-inset-top,0px))",
        left: 26,
        zIndex: 3,
        fontSize: 10,
        letterSpacing: "0.34em",
        color: "var(--gold-pale)",
        opacity: 0.55,
        textShadow: "0 1px 6px rgba(0,0,0,0.8)",
      }}>The LOREMENDER</div>

      <div style={{
        position: "absolute",
        inset: "calc(14px + env(safe-area-inset-top,0px)) 14px calc(14px + var(--safe-bottom))",
        border: "1px solid rgba(205,178,119,0.32)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 3,
      }} />
      <div style={{
        position: "absolute",
        inset: "calc(18px + env(safe-area-inset-top,0px)) 18px calc(18px + var(--safe-bottom))",
        border: "1px solid rgba(205,178,119,0.13)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 3,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 28px calc(40px + var(--safe-bottom))",
      }}>
        <div className="fade-up" style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 440,
          animationDelay: "200ms",
        }}>
          <button className="btn-primary press" onClick={onStart}>开始修补</button>
          <button className="btn-ghost press" onClick={onWorld}>查看设定</button>
          <button className="btn-ghost press" onClick={onShowcase}>参赛档案</button>
        </div>
      </div>
    </div>
  );
}

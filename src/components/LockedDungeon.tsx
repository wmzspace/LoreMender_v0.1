interface LockedDungeonProps {
  title: string;
  subtitle: string;
}

export function LockedDungeon({ title, subtitle }: LockedDungeonProps) {
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

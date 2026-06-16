interface LockedDungeonProps {
  title: string;
  subtitle: string;
  comingSoon?: boolean;
}

export function LockedDungeon({ title, subtitle, comingSoon }: LockedDungeonProps) {
  return (
    <div className="press" style={{
      position:"relative", height: 92, padding: "12px 14px",
      background: comingSoon
        ? "linear-gradient(180deg, rgba(14,22,26,0.92), rgba(7,12,15,0.92))"
        : "linear-gradient(180deg, rgba(11,17,20,0.9), rgba(5,8,11,0.9))",
      border: comingSoon ? "1px solid rgba(205,178,119,0.35)" : "1px solid rgba(70,62,38,0.5)",
      borderLeft: comingSoon ? "3px solid var(--jade)" : "3px solid var(--gold-shadow)",
      borderRadius: 2,
      overflow:"hidden",
      display:"flex", alignItems:"center", gap: 12,
    }}>
      <div className="locked" style={{
        position:"relative",
        width: 64, height: 64, flexShrink: 0,
        background: comingSoon
          ? "radial-gradient(circle at 50% 40%, #0e1e1a, #06090b)"
          : "radial-gradient(circle at 50% 40%, #121b20, #06090b)",
        borderRadius: 2,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div className="title-han" style={{
          fontSize: 34,
          color: comingSoon ? "var(--jade)" : "var(--vermillion-deep)",
          opacity: comingSoon ? 0.45 : 0.5,
        }}>{comingSoon ? "待" : "封"}</div>
      </div>
      <div style={{flex: 1, opacity: comingSoon ? 0.75 : 0.55}}>
        <div style={{fontFamily:"ZCOOL XiaoWei, serif", fontSize: 16, letterSpacing:"0.16em", color: comingSoon ? "var(--gold-pale)" : "#8f7846"}}>
          {title}
        </div>
        <div style={{fontSize: 11, opacity: 0.7, marginTop: 4, letterSpacing:"0.12em"}}>{subtitle}</div>
        <div style={{fontSize: 10, opacity: 0.6, marginTop: 6, color: comingSoon ? "var(--jade-pale)" : "var(--vermillion)"}}>
          {comingSoon ? "· 敬 请 期 待 ·" : "· 封 · 未启 ·"}
        </div>
      </div>
    </div>
  );
}

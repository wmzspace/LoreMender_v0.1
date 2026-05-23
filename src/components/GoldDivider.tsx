interface GoldDividerProps {
  label?: string;
}

export function GoldDivider({ label }: GoldDividerProps) {
  return (
    <div className="gold-divider" style={{margin: "12px 0"}}>
      <span className="mark"></span>
      {label && <span style={{
        fontFamily: "ZCOOL XiaoWei, serif",
        fontSize: 13, letterSpacing: "0.3em", textIndent: "0.3em",
      }}>{label}</span>}
      <span className="mark"></span>
    </div>
  );
}

import { Topbar, PaperPanel, PageHeader } from "../components";
import { Particles, WorldIcon } from "../components/art";

interface WorldPageProps {
  onBack: () => void;
  onEnter: () => void;
}

export function WorldPage({ onBack, onEnter }: WorldPageProps) {
  const cards: { key: "space" | "pollution" | "mender" | "rule"; title: string; line: string }[] = [
    { key:"space", title:"青史空间", line:"所有流传下来的典故，都会在这里形成投影。" },
    { key:"pollution", title:"历史污染", line:"误传、遗忘和篡改，让许多人物的真实情感被掩埋。" },
    { key:"mender", title:"修补者", line:"你不是上帝，不能随意改写生死。" },
    { key:"rule", title:"修补原则", line:"不能强行逆天改命，只能让被遮蔽的价值重新被看见。" },
  ];
  return (
    <div className="page night-bg">
      <Topbar title="设 定" onBack={onBack}/>
      <Particles count={10}/>

      <div className="page-scroll" style={{top: 56, bottom: 92, padding: "0 16px"}}>
        <PageHeader eyebrow="LORE · CODEX" title="典 籍 设 定"/>

        <div style={{display:"flex", flexDirection:"column", gap: 14, paddingBottom: 24}}>
          {cards.map((c, i) => (
            <div key={c.key} className="fade-up"
                 style={{animationDelay: `${i*90}ms`}}>
              <PaperPanel style={{padding: "14px 16px 16px"}}>
                <div style={{display:"flex", gap: 14, alignItems:"flex-start"}}>
                  <div style={{
                    width: 58, height: 58, flexShrink: 0, borderRadius: 6,
                    background:"radial-gradient(circle at 50% 38%, rgba(168,49,31,0.2), rgba(40,30,18,0.06) 64%, transparent 78%)",
                    border:"1px solid rgba(140,107,41,0.55)",
                    boxShadow:"inset 0 0 10px rgba(78,58,20,0.35), inset 0 1px 0 rgba(255,240,205,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <WorldIcon type={c.key}/>
                  </div>
                  <div style={{flex: 1}}>
                    <div className="title-han" style={{
                      fontSize: 17, color:"var(--ink-deep)",
                      letterSpacing:"0.22em", textIndent:"0.22em",
                      marginBottom: 8,
                      borderBottom: "1px solid rgba(78,58,20,0.25)",
                      paddingBottom: 6,
                    }}>{c.title}</div>
                    <div style={{
                      fontSize: 13.5, lineHeight: 1.75,
                      color: "var(--ink)",
                      letterSpacing: "0.04em",
                    }}>{c.line}</div>
                  </div>
                </div>
              </PaperPanel>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position:"absolute", left: 0, right: 0, bottom: 0,
        padding: `12px 20px calc(16px + var(--safe-bottom))`,
        background: "linear-gradient(180deg, transparent, rgba(10,6,4,0.95) 30%)",
      }}>
        <button className="btn-primary press" onClick={onEnter} style={{width: "100%"}}>
          进 入 副 本
        </button>
      </div>
    </div>
  );
}

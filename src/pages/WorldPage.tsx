import { PageShell } from "../components";
import { WorldIcon } from "../components/art";

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
    <PageShell
      eyebrow="LORE · CODEX"
      title="典 籍 设 定"
      onBack={onBack}
      wrap={false}
      footer={
        <div style={{
          padding: `12px 20px calc(16px + var(--safe-bottom))`,
          background: "linear-gradient(180deg, transparent, rgba(7,11,14,0.95) 30%)",
        }}>
          <button className="btn-primary press" onClick={onEnter} style={{ width: "100%", maxWidth: 440, margin: "0 auto", display: "flex" }}>
            进 入 副 本
          </button>
        </div>
      }
    >
      <div className="lore-center">
        <div className="content-wrap">
          <div style={{
            textAlign: "center", maxWidth: 540, margin: "0 auto 22px",
            fontSize: 13, lineHeight: 1.8, color: "rgba(232,228,214,0.78)", letterSpacing: "0.04em",
          }}>修补者行走于青史之间，让被误传与遗忘遮蔽的价值，重新被看见。</div>

          <div className="grid-2">
            {cards.map((c, i) => (
              <div key={c.key} className="lore-card fade-up" style={{ animationDelay: `${i * 90}ms` }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="lore-medallion"><WorldIcon type={c.key} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lore-card-title" style={{
                      marginBottom: 8, paddingBottom: 7,
                      borderBottom: "1px solid rgba(205,178,119,0.18)",
                    }}>{c.title}</div>
                    <div className="lore-card-line">{c.line}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

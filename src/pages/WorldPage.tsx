import { PageShell } from "../components";

interface WorldPageProps {
  onBack: () => void;
  onEnter: () => void;
}

const ENTRIES: { key: string; title: string; line: string; accent?: "vermillion" }[] = [
  { key: "space", title: "青史空间", line: "所有流传下来的典故，都会在这里形成投影。" },
  { key: "pollution", title: "历史污染", line: "误传、遗忘和篡改，让许多人物的真实情感被掩埋。", accent: "vermillion" },
  { key: "mender", title: "修补者", line: "你不是上帝，不能随意改写生死。" },
  { key: "rule", title: "修补原则", line: "不能强行逆天改命，只能让被遮蔽的价值重新被看见。" },
];

export function WorldPage({ onBack, onEnter }: WorldPageProps) {
  return (
    <PageShell
      eyebrow="LORE · CODEX"
      title="典 籍 设 定"
      onBack={onBack}
      wrap={false}
      backdrop={
        <>
          <img src="/images/cover.jpg" alt="" className="codex-bg" />
          <div className="codex-bg-scrim" />
        </>
      }
      footer={
        <div className="codex-footer">
          <button className="btn-primary press" onClick={onEnter} style={{ width: "100%", maxWidth: 440, margin: "0 auto", display: "flex" }}>
            进 入 副 本
          </button>
        </div>
      }
    >
      <div className="codex-page">
        <div className="codex-intro fade-up">
          <span className="codex-intro-mark">·</span>
          修补者行走于青史之间，让被误传与遗忘遮蔽的价值，重新被看见。
          <span className="codex-intro-mark">·</span>
        </div>

        <div className="codex-scroll">
          {ENTRIES.map((it, i) => (
            <div
              key={it.key}
              className={"codex-row fade-up" + (it.accent ? " codex-row--vermillion" : "")}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="codex-row-title">{it.title}</div>
              <div className="codex-row-rule" />
              <div className="codex-row-line">{it.line}</div>
            </div>
          ))}
          <div className="codex-scroll-end" />
        </div>
      </div>
    </PageShell>
  );
}

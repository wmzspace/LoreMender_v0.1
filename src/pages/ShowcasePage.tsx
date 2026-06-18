import { PageShell, SealTag } from "../components";
import { AI_WORKFLOW_RECORDS, LEVEL_ASSET_PLANS } from "../data";

interface ShowcasePageProps {
  onBack: () => void;
  onEnter: () => void;
}

const statusLabel = {
  planned: "待生成",
  generated: "已生成",
  integrated: "已接入",
} as const;

function MiniPath({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", minWidth: 0 }}>
      <span style={{ color: "rgba(232,228,214,0.5)", fontSize: 10, flexShrink: 0 }}>{label}</span>
      <code className="lore-code">{value}</code>
    </div>
  );
}

export function ShowcasePage({ onBack, onEnter }: ShowcasePageProps) {
  return (
    <PageShell eyebrow="AI CAN DO IT" title="参 赛 档 案" onBack={onBack}>
      <div style={{
        textAlign: "center", maxWidth: 520, margin: "0 auto 18px",
        fontSize: 12.5, lineHeight: 1.75, opacity: 0.8,
        color: "rgba(228,224,208,0.88)", letterSpacing: "0.05em",
      }}>五章剧情、AI 素材计划、对话历史与提交材料已经整理到同一条参赛链路里。</div>

      <div className="lore-card fade-up" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div className="lore-card-title" style={{ fontSize: 18, marginBottom: 8 }}>当前可提交版本</div>
            <div className="lore-card-line" style={{ fontSize: 12.5 }}>
              《典故修补者 · 青囊残卷》已经从单段原型扩展为五章可玩叙事 Demo。玩家在华佗临终前夜调查、周旋、托付，并通过不同结局理解“历史不可逆，但文化价值可以被重新看见”。
            </div>
          </div>
          <SealTag>赛</SealTag>
        </div>
        <button className="btn-primary press" onClick={onEnter} style={{ width: "100%", marginTop: 16 }}>
          进入五章剧情
        </button>
      </div>

      <div className="lore-section">五 章 与 AI 素 材</div>

      <div className="grid-2">
        {LEVEL_ASSET_PLANS.map((level, i) => (
          <div key={level.chapter} className="lore-card fade-up" style={{ animationDelay: `${i * 45}ms` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div className="lore-card-title" style={{ fontSize: 16, letterSpacing: "0.1em", textIndent: 0 }}>
                  {level.chapter}. {level.title}
                </div>
                <div className="lore-card-line" style={{ marginTop: 4, fontSize: 11.5 }}>{level.goal}</div>
              </div>
              <span className="lore-status">{statusLabel[level.status]}</span>
            </div>

            <div style={{ display: "grid", gap: 5, marginTop: 11 }}>
              <MiniPath label="插图" value={level.imagePath} />
              <MiniPath label="视频" value={level.videoPath} />
              <MiniPath label="BGM" value={level.bgmPath} />
            </div>

            <details style={{ marginTop: 11 }}>
              <summary className="lore-summary">查看 AI 提示词</summary>
              <div style={{
                marginTop: 8, display: "grid", gap: 8,
                fontSize: 10.5, lineHeight: 1.6,
                color: "rgba(232,228,214,0.7)",
              }}>
                <div><b style={{ color: "var(--gold-pale)" }}>插图：</b>{level.imagePrompt}</div>
                <div><b style={{ color: "var(--gold-pale)" }}>视频：</b>{level.videoPrompt}</div>
                <div><b style={{ color: "var(--gold-pale)" }}>BGM：</b>{level.bgmPrompt}</div>
              </div>
            </details>
          </div>
        ))}
      </div>

      <div className="lore-section">AI 使 用 证 明</div>

      <div className="grid-2">
        {AI_WORKFLOW_RECORDS.map((record, i) => (
          <div key={record.title} className="lore-card fade-up" style={{ animationDelay: `${i * 45}ms` }}>
            <div className="lore-card-title" style={{ fontSize: 15, letterSpacing: "0.1em", textIndent: 0, marginBottom: 6 }}>
              {record.title}
            </div>
            <div className="lore-card-line" style={{ fontSize: 11.5 }}>
              <b style={{ color: "var(--gold-pale)" }}>工具：</b>{record.tool}<br />
              <b style={{ color: "var(--gold-pale)" }}>产出：</b>{record.output}<br />
              <b style={{ color: "var(--gold-pale)" }}>证明：</b>{record.evidence}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

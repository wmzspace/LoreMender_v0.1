import { PageShell } from "../components";
import {
  AI_PIPELINE,
  AI_PIPELINE_INTRO,
  TEAM_NAME,
  TEAM_MEMBERS,
} from "../data";

interface ShowcasePageProps {
  onBack: () => void;
  /** 在封面弹窗中嵌入时,背景透明以透出模糊封面。 */
  embedded?: boolean;
}

export function ShowcasePage({ onBack, embedded }: ShowcasePageProps) {
  return (
    <PageShell eyebrow="AI CAN DO IT" title="制 作 档 案" onBack={onBack} bg={embedded ? "" : "night-bg"}>
      <div style={{
        textAlign: "center", maxWidth: 520, margin: "0 auto 10px",
        fontSize: 14, lineHeight: 1.75, opacity: 0.8,
        color: "rgba(228,224,208,0.88)", letterSpacing: "0.05em",
      }}>制作人员名单</div>

      <div style={{
        textAlign: "center", marginBottom: 18,
        fontSize: 14, letterSpacing: "0.08em",
      }}>
        <span style={{ color: "var(--gold-pale)", fontWeight: 600 }}>{TEAM_NAME}</span>
        <span style={{ color: "rgba(232,228,214,0.5)", margin: "0 8px" }}>·</span>
        <span style={{ color: "rgba(232,228,214,0.82)" }}>{TEAM_MEMBERS.join("  /  ")}</span>
      </div>

      <div className="lore-card fade-up" style={{ marginBottom: 16 }}>
        <div className="lore-card-title" style={{ fontSize: 20, marginBottom: 8, textAlign: "center", textIndent: 0 }}>赛道方向</div>
        <div className="lore-card-line" style={{ fontSize: 14.5, lineHeight: 1.8, textAlign: "center" }}>
          《典故修补者 · 青囊残卷》属文化表达类游戏，以博物馆古籍奇遇为核心设定，打造沉浸式历史穿梭体验。玩家化身典故修补者穿梭历代，不篡改史实，而是通过解谜、对话共情历史人物，弥补千古遗憾、收集典故信物，以互动游戏形式活化传统历史典故，让厚重历史文化具备可感知、可交互、易传播的数字化全新表达。”。
        </div>
      </div>

      <div className="lore-section">AI 使 用 说 明</div>

      <div style={{
        textAlign: "center", maxWidth: 560, margin: "0 auto 14px",
        fontSize: 14.5, lineHeight: 1.8,
        color: "rgba(232,228,214,0.82)", letterSpacing: "0.04em",
      }}>{AI_PIPELINE_INTRO}</div>

      <div className="grid-2">
        {AI_PIPELINE.map((step, i) => (
          <div key={step.index} className="lore-card fade-up" style={{ animationDelay: `${i * 45}ms` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{
                fontFamily: "var(--font-han)", fontSize: 30, lineHeight: 1,
                color: "var(--gold)", flexShrink: 0,
              }}>{step.index}</span>
              <div style={{ minWidth: 0 }}>
                <div className="lore-card-title" style={{ fontSize: 17, letterSpacing: "0.1em", textIndent: 0, marginBottom: 6 }}>
                  {step.title}
                </div>
                <div className="lore-card-line" style={{ fontSize: 13.5, lineHeight: 1.75 }}>{step.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <img
          src="/images/title_with_studio.png"
          alt="典故修补者 · 拾遗工作室"
          style={{ width: "min(64%, 340px)", height: "auto", display: "inline-block", opacity: 0.92 }}
        />
      </div>
      <div aria-hidden style={{ height: 40 }} />
    </PageShell>
  );
}

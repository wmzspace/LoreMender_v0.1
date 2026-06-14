import { PageHeader, PaperPanel, SealTag, Topbar } from "../components";
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
      <span style={{ color: "rgba(42,30,19,0.58)", fontSize: 10, flexShrink: 0 }}>{label}</span>
      <code style={{
        fontSize: 10,
        color: "#3a2c1d",
        background: "rgba(255,255,255,0.28)",
        border: "1px solid rgba(78,58,20,0.16)",
        padding: "2px 4px",
        borderRadius: 2,
        overflowWrap: "anywhere",
      }}>{value}</code>
    </div>
  );
}

export function ShowcasePage({ onBack, onEnter }: ShowcasePageProps) {
  return (
    <div className="page night-bg">
      <Topbar title="参赛档案" onBack={onBack} />

      <div className="page-scroll" style={{ top: 58, bottom: 0, padding: "0 16px calc(30px + var(--safe-bottom))" }}>
        <PageHeader
          eyebrow="AI CAN DO IT"
          title="创作档案"
          intro={<>五章剧情、AI 素材计划、对话历史与提交材料已经整理到同一条参赛链路里。</>}
        />

        <PaperPanel className="fade-up" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontFamily: "ZCOOL XiaoWei, serif",
                fontSize: 18,
                letterSpacing: "0.18em",
                color: "#2a1e13",
                marginBottom: 8,
              }}>当前可提交版本</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "rgba(42,30,19,0.78)" }}>
                《典故修补者 · 青囊残卷》已经从单段原型扩展为五章可玩叙事 Demo。玩家在华佗临终前夜调查、周旋、托付，并通过不同结局理解“历史不可逆，但文化价值可以被重新看见”。
              </div>
            </div>
            <SealTag>赛</SealTag>
          </div>
          <button className="btn-primary press" onClick={onEnter} style={{ width: "100%", marginTop: 14 }}>
            进入五章剧情
          </button>
        </PaperPanel>

        <div style={{
          margin: "18px 0 10px",
          textAlign: "center",
          fontFamily: "ZCOOL XiaoWei, serif",
          fontSize: 13,
          color: "var(--gold-pale)",
          letterSpacing: "0.34em",
          textIndent: "0.34em",
        }}>五章与 AI 素材</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {LEVEL_ASSET_PLANS.map((level, i) => (
            <PaperPanel key={level.chapter} className="fade-up" style={{ animationDelay: `${i * 45}ms`, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "ZCOOL XiaoWei, serif",
                    fontSize: 16,
                    color: "#2a1e13",
                    letterSpacing: "0.12em",
                  }}>{level.chapter}. {level.title}</div>
                  <div style={{ marginTop: 4, fontSize: 11.5, lineHeight: 1.65, color: "rgba(42,30,19,0.72)" }}>
                    {level.goal}
                  </div>
                </div>
                <span style={{
                  flexShrink: 0,
                  fontSize: 10,
                  padding: "4px 7px",
                  color: "#6b1a10",
                  border: "1px solid rgba(107,26,16,0.35)",
                  background: "rgba(168,49,31,0.08)",
                  borderRadius: 2,
                }}>{statusLabel[level.status]}</span>
              </div>

              <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
                <MiniPath label="插图" value={level.imagePath} />
                <MiniPath label="视频" value={level.videoPath} />
                <MiniPath label="BGM" value={level.bgmPath} />
              </div>

              <details style={{ marginTop: 10 }}>
                <summary style={{
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#6b1a10",
                  letterSpacing: "0.08em",
                }}>查看 AI 提示词</summary>
                <div style={{
                  marginTop: 8,
                  display: "grid",
                  gap: 8,
                  fontSize: 10.5,
                  lineHeight: 1.55,
                  color: "rgba(42,30,19,0.78)",
                }}>
                  <div><b>插图：</b>{level.imagePrompt}</div>
                  <div><b>视频：</b>{level.videoPrompt}</div>
                  <div><b>BGM：</b>{level.bgmPrompt}</div>
                </div>
              </details>
            </PaperPanel>
          ))}
        </div>

        <div style={{
          margin: "20px 0 10px",
          textAlign: "center",
          fontFamily: "ZCOOL XiaoWei, serif",
          fontSize: 13,
          color: "var(--gold-pale)",
          letterSpacing: "0.34em",
          textIndent: "0.34em",
        }}>AI 使用证明</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AI_WORKFLOW_RECORDS.map((record, i) => (
            <PaperPanel key={record.title} className="fade-up" style={{ animationDelay: `${i * 45}ms`, padding: 14 }}>
              <div style={{
                fontFamily: "ZCOOL XiaoWei, serif",
                fontSize: 15,
                color: "#2a1e13",
                letterSpacing: "0.12em",
                marginBottom: 5,
              }}>{record.title}</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "rgba(42,30,19,0.76)" }}>
                <b>工具：</b>{record.tool}<br />
                <b>产出：</b>{record.output}<br />
                <b>证明：</b>{record.evidence}
              </div>
            </PaperPanel>
          ))}
        </div>
      </div>
    </div>
  );
}


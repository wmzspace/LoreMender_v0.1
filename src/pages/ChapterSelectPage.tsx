import { CHAPTERS } from "../data";
import type { GameState } from "../data/types";
import { Topbar } from "../components";

interface ChapterSelectPageProps {
  state: GameState;
  onBack: () => void;
  onEnter: () => void;
}

export function ChapterSelectPage({ state, onBack, onEnter }: ChapterSelectPageProps) {
  const current = state.currentChapter || 1;

  return (
    <div className="page night-bg">
      <Topbar title="第一卷 · 青囊残卷" onBack={onBack} />
      <div className="vignette" />
      <div className="page-scroll" style={{ top: 56, bottom: 0, padding: "0 16px calc(24px + var(--safe-bottom))" }}>
        <div style={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          border: "1px solid rgba(205,178,119,0.35)",
          borderRadius: 4,
          background: "#080d10",
        }}>
          <img
            src="/images/levels/1/chapters/dungeon_cover_huatuo.webp"
            alt="青囊残卷"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(5,9,11,0.12), rgba(5,9,11,0.92))",
          }} />
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
            <div className="en-small" style={{ color: "var(--gold-pale)", opacity: 0.68, letterSpacing: "0.24em" }}>VOLUME I</div>
            <div className="title-han" style={{ fontSize: 28, color: "var(--gold-pale)", marginTop: 6 }}>青囊残卷</div>
            <div style={{ color: "var(--paper)", opacity: 0.75, fontSize: 12, lineHeight: 1.7, marginTop: 8 }}>
              建安十三年，许昌大牢中一卷残术将被火光吞没。你要在五章之间补全它的去路。
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {CHAPTERS.map(ch => {
            const done = ch.num < current;
            const active = ch.num === current;
            const locked = ch.num > current;
            return (
              <div key={ch.id} style={{
                border: `1px solid ${active ? "rgba(95,168,146,0.72)" : "rgba(205,178,119,0.28)"}`,
                background: active ? "rgba(95,168,146,0.10)" : "rgba(10,16,20,0.62)",
                borderRadius: 4,
                padding: "12px 13px",
                opacity: locked ? 0.48 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div className="title-han" style={{
                    color: active ? "var(--jade-pale)" : "var(--gold-pale)",
                    fontSize: 18,
                    letterSpacing: "0.14em",
                  }}>{locked ? "未解封章" : ch.name}</div>
                  <div style={{ fontSize: 11, color: "var(--paper)", opacity: 0.58 }}>
                    {done ? "已读" : active ? "当前" : "未解锁"}
                  </div>
                </div>
                <div style={{ marginTop: 7, fontSize: 12, lineHeight: 1.65, color: "var(--paper)", opacity: 0.72 }}>
                  {locked ? "继续前章剧情后解锁。" : ch.brief}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-primary press" onClick={onEnter} style={{ width: "100%", marginTop: 18 }}>
          进入第一卷
        </button>
      </div>
    </div>
  );
}

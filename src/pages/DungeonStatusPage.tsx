import { CHAPTERS, STORY } from "../data";
import type { GameNode, GameState } from "../data/types";
import type { PageKey } from "../lib/routes";
import { BottomNav } from "../components";

interface DungeonStatusPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

const rankText = {
  high: "高",
  mid: "中",
  low: "低",
} as const;

function chapterGames(chapterId: string): GameNode[] {
  return (STORY[chapterId]?.beats ?? [])
    .map((beat) => "game" in beat ? beat.game : null)
    .filter((game): game is GameNode => Boolean(game));
}

export function DungeonStatusPage({ state, gotoPage }: DungeonStatusPageProps) {
  const current = state.currentChapter || 1;
  const items = new Set(state.items ?? []);

  return (
    <div className="page night-bg">
      <div className="page-scroll" style={{ top: 0, bottom: 74, padding: "16px 16px 20px" }}>
        <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
          <div className="en-small" style={{ color: "var(--gold-pale)", opacity: 0.62, letterSpacing: "0.28em" }}>VOLUME PROGRESS</div>
          <div className="title-han" style={{ color: "var(--gold-pale)", fontSize: 24, marginTop: 7 }}>青囊残卷</div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {CHAPTERS.map(ch => {
            const games = chapterGames(ch.id);
            const locked = ch.num > current;
            const active = ch.num === current;
            return (
              <section key={ch.id} style={{
                border: `1px solid ${active ? "rgba(95,168,146,0.68)" : "rgba(205,178,119,0.28)"}`,
                background: active ? "rgba(95,168,146,0.10)" : "rgba(10,16,20,0.58)",
                borderRadius: 4,
                padding: 13,
                opacity: locked ? 0.5 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div className="title-han" style={{ color: active ? "var(--jade-pale)" : "var(--gold-pale)", fontSize: 18 }}>
                    {locked ? "未解封章" : ch.name}
                  </div>
                  <div style={{ color: "var(--paper)", opacity: 0.58, fontSize: 11 }}>
                    {ch.num < current ? "已推进" : active ? "当前" : "未解锁"}
                  </div>
                </div>
                <div style={{ color: "var(--paper)", opacity: 0.7, fontSize: 12, lineHeight: 1.65, marginTop: 7 }}>
                  {locked ? "完成前章后解锁。" : ch.brief}
                </div>
                {games.length > 0 && !locked && (
                  <div style={{ display: "grid", gap: 7, marginTop: 11 }}>
                    {games.map(game => {
                      const result = state.gameResults?.[game.id];
                      const hasRequired = !game.requiredItem || items.has(game.requiredItem);
                      return (
                        <div key={game.id} style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "8px 9px",
                          borderRadius: 4,
                          background: "rgba(228,224,208,0.055)",
                          border: "1px solid rgba(228,224,208,0.08)",
                        }}>
                          <span style={{ color: "var(--paper)", fontSize: 12 }}>{game.name}</span>
                          <span style={{
                            color: result?.completed ? "var(--jade-pale)" : "var(--paper)",
                            opacity: hasRequired ? 0.9 : 0.45,
                            fontSize: 11,
                          }}>
                            {result?.completed ? `最佳 ${rankText[result.best]}` : hasRequired ? "待完成" : "未点亮"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomNav active="clue" onNav={gotoPage} />
      </div>
    </div>
  );
}

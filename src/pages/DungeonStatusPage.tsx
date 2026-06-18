import { CHAPTERS, STORY } from "../data";
import type { GameNode, GameState, GameResultRank } from "../data/types";
import type { PageKey } from "../lib/routes";
import { BottomNav, PageShell } from "../components";

interface DungeonStatusPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

const rankText: Record<GameResultRank, string> = { high: "高", mid: "中", low: "低" };
const rankClass: Record<GameResultRank, string> = { high: "is-high", mid: "is-mid", low: "is-low" };
const HAN = ["", "一", "二", "三", "四", "五"];

function chapterGames(chapterId: string): GameNode[] {
  return (STORY[chapterId]?.beats ?? [])
    .map((beat) => "game" in beat ? beat.game : null)
    .filter((game): game is GameNode => Boolean(game));
}

export function DungeonStatusPage({ state, gotoPage }: DungeonStatusPageProps) {
  const current = state.currentChapter || 1;
  const items = new Set(state.items ?? []);

  return (
    <PageShell
      eyebrow="VOLUME PROGRESS"
      title="线 索 板"
      subtitle="青 囊 残 卷"
      onBack={() => gotoPage("story")}
      footer={<BottomNav active="clue" onNav={gotoPage} />}
      backdrop={
        <>
          <img src="/images/levels/1/chapters/dungeon_cover_huatuo.webp" alt="" className="clue-bg-img" />
          <div className="clue-bg-scrim" />
          <div className="grain" />
        </>
      }
    >
      <div className="clue-list">
        <div className="clue-legend">
          <span className="clue-legend-item"><i className="dot is-current" />当前</span>
          <span className="clue-legend-item"><i className="dot is-done" />已推进</span>
          <span className="clue-legend-item"><i className="dot is-locked" />未解封章</span>
          <span className="clue-legend-tip">每一章的修补进度与小游戏最佳评级</span>
        </div>

        {CHAPTERS.map(ch => {
          const games = chapterGames(ch.id);
          const locked = ch.num > current;
          const active = ch.num === current;
          const done = ch.num < current;
          const variant = locked ? "clue-card--locked" : active ? "clue-card--current" : "clue-card--done";
          const statusLabel = done ? "已 推 进" : active ? "当 前" : "未 解 锁";
          const statusChip = locked ? "is-locked" : active ? "is-current" : "is-done";

          return (
            <section key={ch.id} className={"clue-card lift " + variant}>
              <div className="clue-card-eyebrow">第 {HAN[ch.num]} 章</div>
              <div className="clue-card-head">
                <div className="clue-card-title">{locked ? "未 解 封 章" : ch.name}</div>
                <span className={"clue-chip " + statusChip}>{statusLabel}</span>
              </div>
              <div className="clue-card-brief">
                {locked ? "完成前章后解锁。" : ch.brief}
              </div>

              {games.length > 0 && !locked && (
                <div className="clue-games">
                  {games.map(game => {
                    const result = state.gameResults?.[game.id];
                    const hasRequired = !game.requiredItem || items.has(game.requiredItem);
                    const rk = result?.completed
                      ? rankClass[result.best]
                      : hasRequired ? "is-todo" : "is-dim";
                    const label = result?.completed
                      ? `最佳 · ${rankText[result.best]}`
                      : hasRequired ? "待完成" : "未点亮";
                    return (
                      <div key={game.id} className="clue-game-row">
                        <span className="clue-game-name">{game.name}</span>
                        <span className={"clue-rank " + rk}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}

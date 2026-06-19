import { CLUES, ITEMS } from "../data";
import type { GameState } from "../data/types";
import type { PageKey } from "../lib/routes";
import { BottomNav, PageShell } from "../components";

interface DungeonStatusPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

/** 线索是否已收集：优先看 searchedClues，否则按持有物品 / 章节进度推断。 */
function clueCollected(id: string, state: GameState, items: Set<string>): boolean {
  if ((state.searchedClues ?? []).includes(id)) return true;
  const ch = state.currentChapter || 1;
  switch (id) {
    case "fragment": return items.has("qingsang_fragment") || items.has("scattered_bamboo");
    case "prescription": return items.has("chenbo_prescription") || items.has("chenbo_prescription_full") || ch > 2;
    case "case_record": return items.has("wangji_document") || ch > 3;
    case "song_page": return items.has("xuanyin_song_page") || items.has("xuanyin_song_page_complete") || ch > 4;
    case "wanted": return (state.searchPressure || 0) > 0 || ch >= 3;
    default: return false;
  }
}

export function DungeonStatusPage({ state, gotoPage }: DungeonStatusPageProps) {
  const items = new Set(state.items ?? []);
  // 已得物品：按登记表顺序，仅展示玩家实际持有且已登记的
  const ownedItems = Object.values(ITEMS).filter(it => items.has(it.id));
  const collectedClues = CLUES.filter(c => clueCollected(c.id, state, items));

  return (
    <PageShell
      eyebrow="EVIDENCE"
      title="线 索 板"
      subtitle="随 身 物 品 · 线 索"
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
        {/* ── 随身物品 ── */}
        <section className="cb-section">
          <div className="cb-section-head">
            <span className="cb-section-title">随 身 物 品</span>
            <span className="cb-section-count">{ownedItems.length}</span>
          </div>
          {ownedItems.length === 0 ? (
            <div className="cb-empty">尚未拾得任何物品。在剧情场景里点击可疑之物试试。</div>
          ) : (
            <div className="cb-grid">
              {ownedItems.map(it => (
                <div key={it.id} className="cb-item lift">
                  <div className="cb-item-icon">
                    {it.image
                      ? <img src={it.image} alt={it.name} loading="lazy" />
                      : <span className="cb-item-seal">物</span>}
                  </div>
                  <div className="cb-item-name">{it.name}</div>
                  {it.desc && <div className="cb-item-desc">{it.desc}</div>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 已得线索 ── */}
        <section className="cb-section">
          <div className="cb-section-head">
            <span className="cb-section-title">已 得 线 索</span>
            <span className="cb-section-count">{collectedClues.length} / {CLUES.length}</span>
          </div>
          {collectedClues.length === 0 ? (
            <div className="cb-empty">线索会随剧情推进逐条显现。</div>
          ) : (
            <div className="cb-clues">
              {collectedClues.map(c => (
                <div key={c.id} className="cb-clue lift">
                  <div className="cb-clue-title">{c.title}</div>
                  <div className="cb-clue-body">{c.body}</div>
                  {c.note && <div className="cb-clue-note">{c.note}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

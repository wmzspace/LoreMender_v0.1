import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORY } from "../data";
import type { GameNode, GameResultRank, GameState } from "../data/types";
import type { PageKey } from "../lib/routes";
import { saveState } from "../lib/storage";
import { Toast, Topbar } from "../components";

interface MiniGamePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

const RANK_WEIGHT: Record<GameResultRank, number> = { low: 0, mid: 1, high: 2 };
const RANK_LABEL: Record<GameResultRank, string> = { high: "高", mid: "中", low: "低" };

function allGameNodes(): GameNode[] {
  return Object.values(STORY).flatMap(ch => ch.beats.flatMap(beat => ("game" in beat ? [beat.game] : [])));
}

function addUnique(list: string[], item: string) {
  return list.includes(item) ? list : [...list, item];
}

function applyResult(state: GameState, game: GameNode, rank: GameResultRank): GameState {
  const prev = state.gameResults[game.id];
  const best = !prev || RANK_WEIGHT[rank] > RANK_WEIGHT[prev.best] ? rank : prev.best;
  const skill = game.reward.skill;
  return {
    ...state,
    items: addUnique(addUnique(state.items, game.unlockItem), game.reward.item),
    gameResults: {
      ...state.gameResults,
      [game.id]: { best, attempts: (prev?.attempts || 0) + 1, completed: true },
    },
    ...(skill ? { [skill]: Math.max(Number(state[skill] || 0), RANK_WEIGHT[rank]) } : {}),
  };
}

function Shell({
  game, state, gotoPage, children, toast, setToast,
}: {
  game: GameNode;
  state: GameState;
  gotoPage: (p: PageKey) => void;
  children: React.ReactNode;
  toast: string;
  setToast: (s: string) => void;
}) {
  const best = state.gameResults[game.id]?.best;
  return (
    <div className="page night-bg">
      <Topbar title={game.name} onBack={() => gotoPage("story")} />
      <div className="page-scroll" style={{ top: 58, padding: "0 16px calc(28px + var(--safe-bottom))" }}>
        <div style={{ color: "var(--paper)", lineHeight: 1.7 }}>
          <div className="title-han" style={{ color: "var(--gold-pale)", fontSize: 22, margin: "8px 0 6px" }}>
            {game.name}
          </div>
          <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 12 }}>
            {best ? `当前最佳：完成度${RANK_LABEL[best]}` : "尚未完成"}
          </div>
          {children}
        </div>
      </div>
      <Toast text={toast} onDone={() => setToast("")} />
    </div>
  );
}

const classifyWords = {
  病症: ["发热", "咳嗽", "头痛", "失眠", "腹泻", "眩晕", "乏力", "心悸", "胃痛"],
  医理: ["阴阳", "脉象", "气血", "经络", "脏腑", "望诊", "问诊", "病因", "体质"],
  药方: ["汤剂", "抓药", "药材", "配伍", "方剂", "剂量", "膏滋", "药引", "煎药"],
};

const classifyCategories = ["病症", "医理", "药方"] as const;

function BambooPuzzle({ finish, onClassifyRetry }: { finish: (rank: GameResultRank) => void; onClassifyRetry: (retry: boolean) => void }) {
  const allWords = useMemo(() => {
    // 每个类别随机选取 5 个，共 15 个词语
    const pickRandom = (arr: string[], n: number) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, n);
    };
    const words: { id: string; text: string; target: string }[] = [];
    (Object.keys(classifyWords) as Array<keyof typeof classifyWords>).forEach(cat => {
      pickRandom(classifyWords[cat], 5).forEach(w => words.push({ id: w, text: w, target: cat }));
    });
    // 打乱顺序
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  }, []);
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const finishedRef = useRef(false);
  const allPlaced = allWords.every(w => placed[w.id]);
  const mistakes = Object.entries(placed).filter(([id, cat]) => {
    const word = allWords.find(w => w.id === id);
    return word && word.target !== cat;
  });
  const allCorrect = mistakes.length === 0;

  // 用 ref 保存 finish 避免 useEffect 依赖问题
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // 提交后全部正确 → 通过 useEffect 触发完成，避免在 render 中调用 setState
  useEffect(() => {
    if (submitted && allCorrect && !finishedRef.current) {
      finishedRef.current = true;
      finishRef.current("high");
    }
  }, [submitted, allCorrect]);

  // 提交后全部正确，渲染 null（等待 useEffect 触发跳转）
  if (submitted && allCorrect) {
    return null;
  }

  if (submitted && !allCorrect) {
    return (
      <>
        <p>分类有 {mistakes.length} 个错误（红色标记）。你可以选择：</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {classifyCategories.map(cat => {
            const catWords = Object.entries(placed).filter(([, v]) => v === cat).map(([k]) => k);
            return (
              <div key={cat} style={{
                border: "1px solid rgba(205,178,119,0.35)",
                borderRadius: 6,
                padding: 8,
                minHeight: 120,
                background: "rgba(236,220,166,0.04)",
              }}>
                <div style={{ marginBottom: 6 }}>
                  <span className="choice-label">{cat} · {catWords.length}/5</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {catWords.map(w => {
                    const isCorrect = classifyWords[cat].includes(w);
                    return (
                      <span key={w} style={{
                        fontSize: 11,
                        border: "1px solid rgba(205,178,119,0.3)",
                        background: isCorrect ? "rgba(95,168,146,0.25)" : "rgba(178,58,44,0.35)",
                        padding: "2px 6px",
                        borderRadius: 3,
                        color: "var(--paper)",
                      }}>{w}</span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <button className="btn-primary press" onClick={() => {
            setSubmitted(false);
            // 清除错误项，让玩家重新放置
            const toRemove: string[] = [];
            mistakes.forEach(([id]) => toRemove.push(id));
            setPlaced(prev => {
              const next = { ...prev };
              toRemove.forEach(id => delete next[id]);
              return next;
            });
            onClassifyRetry(true);
          }} style={{ width: "100%" }}>
            继续修正（华容道·简单）
          </button>
          <button className="btn-ghost press" onClick={() => {
            onClassifyRetry(false);
            finish("low");
          }} style={{ width: "100%" }}>
            退出（华容道·中等）
          </button>
        </div>
      </>
    );
  }

  const remaining = allWords.filter(w => !placed[w.id]);

  return (
    <>
      <p>将下方 15 个词语分类到对应的「病症 / 医理 / 药方」类别中。点击类别中的词语可移回待分类区。</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0", maxHeight: 200, overflowY: "auto" }}>
        {remaining.map(w => (
          <button key={w.id} className="btn-ghost press" onClick={() => setSelected(w.id)}
            style={{
              padding: "6px 10px",
              fontSize: 13,
              borderColor: selected === w.id ? "var(--jade)" : undefined,
              opacity: 1,
            }}>{w.text}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {classifyCategories.map(cat => {
          const catWords = Object.entries(placed).filter(([, v]) => v === cat).map(([k]) => k);
          const count = catWords.length;
          return (
            <div key={cat} style={{
              border: "1px solid rgba(205,178,119,0.35)",
              borderRadius: 6,
              padding: 8,
              minHeight: 120,
              background: "rgba(236,220,166,0.04)",
            }}>
              <button className="choice press" onClick={() => {
                if (!selected) return;
                setPlaced(prev => ({ ...prev, [selected!]: cat }));
                setSelected(null);
              }} style={{ width: "100%", marginBottom: 6 }}>
                <span className="choice-label">{cat} · {count}/5</span>
              </button>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {catWords.map(w => (
                  <button key={w} onClick={() => {
                    setPlaced(prev => {
                      const next = { ...prev };
                      delete next[w];
                      return next;
                    });
                    setSelected(null);
                  }} style={{
                    fontSize: 11,
                    cursor: "pointer",
                    border: "1px solid rgba(205,178,119,0.3)",
                    background: "rgba(236,220,166,0.10)",
                    padding: "2px 6px",
                    borderRadius: 3,
                    color: "var(--paper)",
                  }}>{w}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn-primary press" disabled={!allPlaced} onClick={() => setSubmitted(true)} style={{ width: "100%", marginTop: 16 }}>
        完成分类
      </button>
    </>
  );
}

// 华容道滑块拼图：4列×5行，目标是让钥匙(1×2横)到达右下角出口(r4,c3)
const COLS = 4;
const ROWS = 5;
const KEY_ID = 1;
const EXIT_ROW = 4; // 钥匙(1×2横)到达 row=4, col=2 占据(r4,c2)(r4,c3)即为出口
const EXIT_COL = 2;
const CELL_SIZE = 48; // 每格像素大小

interface Block {
  id: number;
  w: number;
  h: number;
  r: number;
  c: number;
}

// 简单版：继续修正，4个空格（(r2,c2), (r3,c1), (r4,c1), (r4,c2)）
// [木A][木A][木B][木B]   ← 木A横1×2(r0,c0), 木B横1×2(r0,c2)
// [木C][钥 ][钥 ][木D]   ← 木C竖2×1(r1,c0), 钥匙横1×2(r1,c1), 木D竖2×1(r1,c3)
// [木C][木E][   ][木D]   ← 木E1×1(r2,c1)
// [木F][   ][木G][木G]   ← 木F竖2×1(r3,c0), 木G横1×2(r3,c2)
// [木F][   ][   ][出 ]   ← 出口(r4,c3)
function createEasyBlocks(): Block[] {
  return [
    { id: 1,  w: 2, h: 1, r: 1, c: 1 }, // 钥匙 横1×2
    { id: 2,  w: 2, h: 1, r: 0, c: 0 }, // 木A 横2×1
    { id: 3,  w: 2, h: 1, r: 0, c: 2 }, // 木B 横2×1
    { id: 4,  w: 1, h: 2, r: 1, c: 0 }, // 木C 竖1×2
    { id: 5,  w: 1, h: 2, r: 1, c: 3 }, // 木D 竖1×2
    { id: 6,  w: 1, h: 1, r: 2, c: 1 }, // 木E 1×1
    { id: 7,  w: 1, h: 2, r: 3, c: 0 }, // 木F 竖1×2
    { id: 8,  w: 2, h: 1, r: 3, c: 2 }, // 木G 横2×1
  ];
}

// 中等版：退出分类，3个空格（(r2,c2), (r3,c1), (r4,c1)）
// [木A][木A][木B][木B]   ← 木A横1×2(r0,c0), 木B横1×2(r0,c2)
// [木C][钥 ][钥 ][木D]   ← 木C竖2×1(r1,c0), 钥匙横1×2(r1,c1), 木D竖2×1(r1,c3)
// [木C][木E][   ][木D]   ← 木E1×1(r2,c1)
// [木G][   ][木F][木F]   ← 木G竖2×1(r3,c0), 木F横2×1(r3,c2)
// [木G][   ][木H][出 ]   ← 木H1×1(r4,c2), 出口(r4,c3)
function createMediumBlocks(): Block[] {
  return [
    { id: 1,  w: 2, h: 1, r: 1, c: 1 }, // 钥匙 横1×2
    { id: 2,  w: 2, h: 1, r: 0, c: 0 }, // 木A 横2×1
    { id: 3,  w: 2, h: 1, r: 0, c: 2 }, // 木B 横2×1
    { id: 4,  w: 1, h: 2, r: 1, c: 0 }, // 木C 竖1×2
    { id: 5,  w: 1, h: 2, r: 1, c: 3 }, // 木D 竖1×2
    { id: 6,  w: 1, h: 1, r: 2, c: 1 }, // 木E 1×1
    { id: 7,  w: 2, h: 1, r: 3, c: 2 }, // 木F 横2×1
    { id: 8,  w: 1, h: 2, r: 3, c: 0 }, // 木G 竖1×2
    { id: 9,  w: 1, h: 1, r: 4, c: 2 }, // 木H 1×1
  ];
}

function buildGrid(blocks: Block[]): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  blocks.forEach(b => {
    for (let dr = 0; dr < b.h; dr++) {
      for (let dc = 0; dc < b.w; dc++) {
        grid[b.r + dr][b.c + dc] = b.id;
      }
    }
  });
  return grid;
}

function canMove(grid: (number | null)[][], block: Block, dr: number, dc: number): boolean {
  const nr = block.r + dr;
  const nc = block.c + dc;
  if (nr < 0 || nc < 0 || nr + block.h > ROWS || nc + block.w > COLS) return false;
  for (let rr = 0; rr < block.h; rr++) {
    for (let cc = 0; cc < block.w; cc++) {
      const cell = grid[nr + rr][nc + cc];
      if (cell !== null && cell !== block.id) return false;
    }
  }
  return true;
}

function WoodenBox({ finish, hardMode }: { finish: (rank: GameResultRank) => void; hardMode: boolean }) {
  const [blocks, setBlocks] = useState<Block[]>(() => hardMode ? createMediumBlocks() : createEasyBlocks());
  const [steps, setSteps] = useState(0);
  const [dragging, setDragging] = useState<number | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const grid = useMemo(() => buildGrid(blocks), [blocks]);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const keyBlock = blocks.find(b => b.id === KEY_ID)!;
  const solved = keyBlock.r === EXIT_ROW && keyBlock.c === EXIT_COL;

  const moveBlock = useCallback((id: number, dr: number, dc: number) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === id);
      if (!block) return prev;
      const curGrid = buildGrid(prev);
      if (!canMove(curGrid, block, dr, dc)) return prev;
      return prev.map(b => b.id === id ? { ...b, r: b.r + dr, c: b.c + dc } : b);
    });
    setSteps(s => s + 1);
  }, []);

  // 鼠标/触摸拖拽
  const handlePointerDown = useCallback((e: React.PointerEvent, id: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(id);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging === null || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const threshold = CELL_SIZE * 0.4;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      const curBlocks = blocksRef.current;
      const block = curBlocks.find(b => b.id === dragging);
      if (!block) return;
      const curGrid = buildGrid(curBlocks);

      // 判断主要方向
      let dr = 0, dc = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        dc = dx > 0 ? 1 : -1;
      } else {
        dr = dy > 0 ? 1 : -1;
      }

      if (canMove(curGrid, block, dr, dc)) {
        moveBlock(dragging, dr, dc);
      }
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  }, [dragging, moveBlock]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDragging(null);
    dragStart.current = null;
  }, []);

  // 简单版：≤30高, 31-60中, >60低；中等版：≤50高, 51-90中, >90低
  const rankThresholds = hardMode
    ? { high: 50, mid: 90 }
    : { high: 30, mid: 60 };

  const BLOCK_COLOR = "rgba(158,134,91,0.55)";
  const KEY_COLOR = "rgba(205,152,62,0.85)";
  const EMPTY_COLOR = "rgba(236,220,166,0.06)";
  const EXIT_COLOR = "rgba(95,168,146,0.25)";

  const totalW = COLS * CELL_SIZE;
  const totalH = ROWS * CELL_SIZE;

  const diffLabel = hardMode ? "中等版" : "简单版";

  return (
    <>
      <p>拖拽方块，将金色钥匙移到右下角出口解开木盒。（{diffLabel}）</p>
      <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>步数：{steps}</div>
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          width: totalW,
          height: totalH,
          margin: "8px auto",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* 背景网格 */}
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const isExit = r === ROWS - 1 && c === 3;
          return (
            <div
              key={`bg-${i}`}
              style={{
                position: "absolute",
                left: c * CELL_SIZE + 1,
                top: r * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background: isExit ? EXIT_COLOR : EMPTY_COLOR,
                borderRadius: 2,
                border: "1px solid rgba(205,178,119,0.12)",
              }}
            />
          );
        })}
        {/* 方块 */}
        {blocks.map(block => {
          const isKey = block.id === KEY_ID;
          const isDragging = dragging === block.id;
          return (
            <div
              key={block.id}
              onPointerDown={(e) => handlePointerDown(e, block.id)}
              style={{
                position: "absolute",
                left: block.c * CELL_SIZE + 2,
                top: block.r * CELL_SIZE + 2,
                width: block.w * CELL_SIZE - 4,
                height: block.h * CELL_SIZE - 4,
                background: isKey ? KEY_COLOR : BLOCK_COLOR,
                border: isDragging ? "2px solid var(--gold-pale)" : "1px solid rgba(205,178,119,0.25)",
                borderRadius: 5,
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: isDragging ? "none" : "left 0.1s ease, top 0.1s ease",
                zIndex: isDragging ? 2 : 1,
              }}
            >
              {isKey ? (
                <span style={{ fontSize: CELL_SIZE * 0.45, lineHeight: 1 }}>🔑</span>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        className="btn-primary press"
        disabled={!solved}
        onClick={() => finish(steps <= rankThresholds.high ? "high" : steps <= rankThresholds.mid ? "mid" : "low")}
        style={{ width: "100%", marginTop: 10 }}
      >
        解开木盒
      </button>
    </>
  );
}

const prescriptions = [
  { name: "桂枝汤", herbs: ["桂枝", "芍药", "甘草", "生姜", "大枣"] },
  { name: "四君子汤", herbs: ["人参", "白术", "茯苓", "甘草"] },
  { name: "生脉散", herbs: ["人参", "麦冬", "五味子"] },
];

function HerbMemory({ finish }: { finish: (rank: GameResultRank) => void }) {
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const herbs = Array.from(new Set(prescriptions.flatMap(p => p.herbs))).sort();

  useEffect(() => {
    if (!started || remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining(v => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [started, remaining]);

  if (!started) {
    return (
      <>
        <p>开始后有真实 60 秒记忆时间。时间结束后药方隐藏，再把药材整理到对应药方框内。</p>
        <button className="btn-primary press" onClick={() => setStarted(true)} style={{ width: "100%" }}>开始记忆</button>
      </>
    );
  }

  if (remaining > 0) {
    return (
      <>
        <p>记忆时间：{remaining} 秒</p>
        {prescriptions.map(p => (
          <div key={p.name} className="dialogue" style={{ margin: "10px 0" }}>
            <div className="dialogue-name">{p.name}</div>
            <div>{p.herbs.join("、")}</div>
          </div>
        ))}
        <button className="btn-primary press" onClick={() => setRemaining(0)} style={{ width: "100%", marginTop: 12 }}>
          开始整理（跳过记忆）
        </button>
      </>
    );
  }

  const submit = () => {
    let correct = 0;
    let total = 0;
    prescriptions.forEach(p => {
      const got = placed[p.name] || [];
      p.herbs.forEach(h => {
        total++;
        if (got.includes(h)) correct++;
      });
    });
    finish(correct === total ? "high" : correct >= total - 2 ? "mid" : "low");
  };

  return (
    <>
      <p>药方已经收起。先点药材，再点药方框。</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {herbs.map(h => (
          <button key={h} className="btn-ghost press" onClick={() => setSelected(h)}
            style={{ borderColor: selected === h ? "var(--jade)" : undefined }}>{h}</button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {prescriptions.map(p => (
          <button key={p.name} className="choice press" onClick={() => {
            if (!selected) return;
            setPlaced(prev => {
              const list = prev[p.name] || [];
              return { ...prev, [p.name]: list.includes(selected) ? list : [...list, selected] };
            });
            setSelected(null);
          }}>
            <span className="choice-label">{p.name}: {(placed[p.name] || []).join("、") || "待整理"}</span>
          </button>
        ))}
      </div>
      <button className="btn-primary press" onClick={submit} style={{ width: "100%", marginTop: 16 }}>提交验方</button>
    </>
  );
}

function SimpleOrderGame({
  intro, items, correct, finishLabel, finish,
}: {
  intro: string;
  items: string[];
  correct: string[];
  finishLabel: string;
  finish: (rank: GameResultRank) => void;
}) {
  const [pool, setPool] = useState(items);
  const [answer, setAnswer] = useState<string[]>([]);
  const choose = (item: string) => {
    setPool(p => p.filter(x => x !== item));
    setAnswer(a => [...a, item]);
  };
  const reset = () => {
    setPool(items);
    setAnswer([]);
  };
  const submit = () => {
    const exact = answer.every((x, i) => x === correct[i]);
    const firstTwo = answer.slice(0, 2).every((x, i) => x === correct[i]);
    finish(exact ? "high" : firstTwo ? "mid" : "low");
  };
  return (
    <>
      <p>{intro}</p>
      <div className="dialogue" style={{ margin: "10px 0" }}>
        <div className="dialogue-name">你的排序</div>
        <div>{answer.join(" → ") || "尚未选择"}</div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {pool.map(item => <button key={item} className="choice press" onClick={() => choose(item)}><span className="choice-label">{item}</span></button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <button className="btn-ghost press" onClick={reset}>重排</button>
        <button className="btn-primary press" disabled={answer.length !== items.length} onClick={submit}>{finishLabel}</button>
      </div>
    </>
  );
}

function SongFormula({ finish }: { finish: (rank: GameResultRank) => void }) {
  const [keepWarning, setKeepWarning] = useState(true);
  return (
    <>
      <SimpleOrderGame
        intro="把残缺歌诀排成能传唱、也不误人的顺序。若删去禁忌提示，结算会降为低。"
        items={["急症先辨寒与热", "药入口前问禁忌", "轻症可歌传乡里", "重方仍须问医者"]}
        correct={["急症先辨寒与热", "药入口前问禁忌", "轻症可歌传乡里", "重方仍须问医者"]}
        finishLabel="补成歌诀"
        finish={(rank) => finish(keepWarning ? rank : "low")}
      />
      <button className="btn-ghost press" onClick={() => setKeepWarning(v => !v)} style={{ width: "100%", marginTop: 10 }}>
        {keepWarning ? "已保留禁忌提示" : "已删去禁忌提示"}
      </button>
    </>
  );
}

export function MiniGamePage({ state, setState, gotoPage }: MiniGamePageProps) {
  const game = allGameNodes().find(g => g.id === state.activeGameId) || allGameNodes()[0];
  const [toast, setToast] = useState("");
  const [localClassifyRetry, setLocalClassifyRetry] = useState<boolean | null>(state.classifyRetry);
  const finish = (rank: GameResultRank) => {
    const ns = applyResult(state, game, rank);
    setState(ns);
    saveState(ns);
    setToast(`完成度${RANK_LABEL[rank]}，获得${game.unlockItem}`);
    window.setTimeout(() => gotoPage("story"), 900);
  };

  const handleClassifyRetry = (retry: boolean) => {
    setLocalClassifyRetry(retry);
    // 持久化到 state
    const ns = { ...state, classifyRetry: retry };
    setState(ns);
    saveState(ns);
  };

  const locked = game.requiredItem && !state.items.includes(game.requiredItem);

  // 华容道难度：classifyRetry=true(继续修正) → 简单, classifyRetry=false(退出) → 中等
  const woodenBoxHard = localClassifyRetry === false;

  let body: React.ReactNode;
  if (locked) {
    body = <p>尚未获得进入此机关所需之物。</p>;
  } else if (game.kind === "bambooPuzzle") {
    body = <BambooPuzzle finish={finish} onClassifyRetry={handleClassifyRetry} />;
  } else if (game.kind === "woodenBox") {
    body = <WoodenBox finish={finish} hardMode={woodenBoxHard} />;
  } else if (game.kind === "herbMemory") {
    body = <HerbMemory finish={finish} />;
  } else if (game.kind === "caseTriage") {
    body = (
      <SimpleOrderGame
        intro="按病情急缓与可救概率排序，不按身份权势排序。"
        items={["军士：外伤失血，尚可止血", "孩童：高热惊厥，需立刻处置", "老仆：久咳体虚，可稍后调养"]}
        correct={["孩童：高热惊厥，需立刻处置", "军士：外伤失血，尚可止血", "老仆：久咳体虚，可稍后调养"]}
        finishLabel="提交病案"
        finish={finish}
      />
    );
  } else {
    body = <SongFormula finish={finish} />;
  }

  return (
    <Shell game={game} state={state} gotoPage={gotoPage} toast={toast} setToast={setToast}>
      {body}
    </Shell>
  );
}

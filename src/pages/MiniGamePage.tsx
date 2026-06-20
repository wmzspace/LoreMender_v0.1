import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORY } from "../data";
import type { GameNode, GameResultRank, GameState } from "../data/types";
import type { PageKey } from "../lib/routes";
import { saveState } from "../lib/storage";
import { playSfx } from "../lib/audio";
import { Toast, PageShell } from "../components";

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

function addItems(list: string[], items: string[]) {
  return items.reduce(addUnique, list);
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

function applyNarrativeResult(state: GameState, game: GameNode, rank: GameResultRank): GameState {
  const inc = rank === "high" ? 2 : rank === "mid" ? 1 : 0;
  let next = { ...state };

  if (game.id === "bamboo_puzzle") {
    next.record_tendency = Math.max(next.record_tendency || 0, inc >= 1 ? 1 : 0);
  }

  if (game.id === "wooden_box") {
    next.searchPressure = Math.max(0, (next.searchPressure || 0) + (rank === "low" ? 1 : 0));
  }

  if (game.id === "herb_memory") {
    const qualityItem =
      rank === "high" ? "chenbo_prescription_full" :
      rank === "mid" ? "chenbo_prescription_partial" :
      "chenbo_prescription_stained";
    next = {
      ...next,
      items: addUnique(next.items, qualityItem),
      record_tendency: Math.max(next.record_tendency || 0, rank === "high" ? 2 : rank === "mid" ? 1 : 0),
      searchPressure: Math.max(0, (next.searchPressure || 0) + (rank === "low" ? 1 : 0)),
    };
  }

  if (game.id === "case_triage") {
    const qualityItem =
      rank === "high" ? "case_record_full" :
      rank === "mid" ? "case_record_partial" :
      "case_record_flawed";
    next = {
      ...next,
      items: addItems(next.items, [qualityItem, "wangji_fake_doc"]),
      system_tendency: Math.max(next.system_tendency || 0, rank === "high" ? 2 : rank === "mid" ? 1 : 0),
      searchPressure: Math.max(0, (next.searchPressure || 0) + (rank === "low" ? 1 : 0)),
    };
  }

  if (game.id === "song_formula") {
    const qualityItem =
      rank === "high" ? "xuanyin_song_page_complete" :
      rank === "mid" ? "xuanyin_song_page_corrected" :
      "xuanyin_song_page_unclean";
    const extraItems = rank === "high" ? [qualityItem, "forbidden_record"] : [qualityItem];
    next = {
      ...next,
      items: addItems(next.items, extraItems),
      spread_tendency: Math.max(next.spread_tendency || 0, inc),
      searchPressure: Math.max(0, (next.searchPressure || 0) + (rank === "low" ? 1 : 0)),
    };
  }

  return next;
}

// ── 游戏完成反馈数据 ───────────────────────────────────────────
const GAME_FEEDBACK: Record<string, Record<GameResultRank, { title: string; text: string }>> = {
  bambooPuzzle: {
    high: { title: "竹简归位", text: "华佗说：「书能拼起，只是第一步。但你摸到了它的脉络——字句之间有一套活的逻辑。」" },
    mid:  { title: "大半复原", text: "华佗说：「差一点。再想想字句背后的意思。医书不是目录，每一排都有它的位置。」" },
    low:  { title: "残缺犹存", text: "华佗说：「这就是残卷为何难传的原因。能拼起的，不只是竹简，是看懂它的人。」" },
  },
  woodenBox: {
    high: { title: "机关已解", text: "华佗说：「能用最少的代价解开困局，这才是医道——不浪费，不强求，走最短的路。」" },
    mid:  { title: "峰回路转", text: "华佗说：「能出来就好。多走了些弯路，但弯路也是路，你走过了。」" },
    low:  { title: "曲折出关", text: "华佗说：「步步错落，靠摸索才得出路。不要紧——每一次试探都刻进了手里。」" },
  },
  herbMemory: {
    high: { title: "药案整理完备", text: "华佗说：「认药如识人，你记住了它们各自的模样。一味草药，背后是无数人的试验。」" },
    mid:  { title: "大体整妥", text: "华佗说：「药名好记，药性需亲历方知。你记住了大半，剩下的靠经验来补。」" },
    low:  { title: "药案残缺", text: "华佗说：「草药不认识你，你也需要先认识它们。不懂时，就先不用——这也是一条规矩。」" },
  },
  caseTriage: {
    high: { title: "病案顺序正确", text: "华佗说：「医者不论贵贱，只看谁更需要这双手。你做到了这一点。」" },
    mid:  { title: "轻重有序", text: "华佗说：「有时候，多看一眼就是多一条命。你快到了，下次再准一点。」" },
    low:  { title: "顺序待正", text: "华佗说：「把人命排出轻重，这是医者最难过的关。规则只有一条：看谁更需要被救。」" },
  },
  songFormula: {
    high: { title: "歌成定界", text: "玄音看着你划去的几句重方，轻轻点头。「原来传医理，不是唱得越多越好。能救急的，让百姓记住；会误人的，留给医者。」歌声从巷尾散开——你第一次觉得，纸以外也能有书。" },
    mid:  { title: "界限微差", text: "玄音哼了两句又停下。「大体能传，可还有一两句拿不准。歌可以快，医理不能乱——再想想哪些该留下。」" },
    low:  { title: "界限未明", text: "玄音刚拨响琴弦，又按住了弦。「这一句若传开，怕是会有人照着乱用。小郎中，歌可以快，医理不能乱。」" },
  },
};

// ── 等级圆形印章 ───────────────────────────────────────────────
function RankSeal({ rank }: { rank: GameResultRank }) {
  const c = rank === "high"
    ? { ring: "#5fa892", text: "#a6dccb", glow: "rgba(95,168,146,0.45)" }
    : rank === "mid"
    ? { ring: "#cdb277", text: "#ecdca6", glow: "rgba(205,178,119,0.4)" }
    : { ring: "rgba(228,224,208,0.5)", text: "rgba(228,224,208,0.75)", glow: "rgba(228,224,208,0.12)" };
  const sz = 92, r = sz / 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}
      style={{ filter: `drop-shadow(0 0 16px ${c.glow})` }}>
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke={c.ring} strokeWidth="1" strokeOpacity="0.4" />
      <circle cx={r} cy={r} r={r - 7} fill="#060d14" />
      <circle cx={r} cy={r} r={r - 7} fill="none" stroke={c.ring} strokeWidth="1.8" />
      <text x={r} y={r + 11} textAnchor="middle"
        fontFamily="var(--font-han)" fontSize="32" fill={c.text}>
        { rank === "high" ? "优" : rank === "mid" ? "良" : "勉" }
      </text>
    </svg>
  );
}

// ── 游戏完成反馈浮层（印章+旁白，轻触继续）─────────────────────
function GameFeedbackOverlay({ rank, game, onDismiss }: {
  rank: GameResultRank;
  game: GameNode;
  onDismiss: () => void;
}) {
  const fb = GAME_FEEDBACK[game.kind]?.[rank] ?? { title: "完成", text: "" };
  return (
    <div
      role="dialog"
      onClick={onDismiss}
      style={{
        position: "absolute", inset: 0, zIndex: 200,
        background: "rgba(4,7,10,0.93)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 28px",
        animation: "fadeIn 0.35s ease both",
        cursor: "pointer",
      }}
    >
      <div style={{ animation: "sealStamp 0.55s cubic-bezier(0.2,0.8,0.3,1) 0.08s both", marginBottom: 22 }}>
        <RankSeal rank={rank} />
      </div>
      <div className="title-han fade-in" style={{
        fontSize: 19, color: "var(--gold-pale)",
        letterSpacing: "0.22em", textAlign: "center",
        marginBottom: 14, animationDelay: "180ms",
      }}>{fb.title}</div>
      <div className="fade-in" style={{
        fontSize: 13, color: "rgba(228,224,208,0.78)",
        lineHeight: 1.95, letterSpacing: "0.04em",
        textAlign: "center", maxWidth: 292,
        marginBottom: 40, fontStyle: "italic",
        animationDelay: "320ms",
      }}>{fb.text}</div>
      <div className="fade-in" style={{
        fontSize: 11, color: "rgba(228,224,208,0.35)",
        letterSpacing: "0.35em", animationDelay: "550ms",
      }}>轻 触 继 续</div>
    </div>
  );
}

const RANK_COLOR: Record<GameResultRank, string> = {
  high: "#5fa892",
  mid: "#cdb277",
  low: "rgba(228,224,208,0.55)",
};

// 游戏说明文字样式（统一的美术风格）
const instStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: "rgba(228,224,208,0.58)",
  lineHeight: 1.9,
  letterSpacing: "0.04em",
  textAlign: "center",
  fontStyle: "italic",
  margin: "0 0 16px",
  padding: "0 4px",
};

function Shell({
  game, state, gotoPage, children, toast, setToast, overlay,
}: {
  game: GameNode;
  state: GameState;
  gotoPage: (p: PageKey) => void;
  children: React.ReactNode;
  toast: string;
  setToast: (s: string) => void;
  overlay?: React.ReactNode;
}) {
  const result = state.gameResults[game.id];
  const best = result?.best;
  const attempts = result?.attempts ?? 0;

  const rankBadge = best ? (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 2,
      border: `1px solid ${RANK_COLOR[best]}50`,
      background: `${RANK_COLOR[best]}1a`,
    }}>
      <span style={{ fontSize: 10, color: RANK_COLOR[best], letterSpacing: "0.15em" }}>
        最 佳 · {RANK_LABEL[best]}
      </span>
      {attempts > 1 && (
        <span style={{ fontSize: 9, color: "rgba(228,224,208,0.35)" }}>×{attempts}</span>
      )}
    </div>
  ) : (
    <span style={{ fontSize: 10, color: "rgba(228,224,208,0.3)", letterSpacing: "0.15em" }}>
      初 次 挑 战
    </span>
  );

  return (
    <>
      <PageShell
        title={game.name}
        right={rankBadge}
        onBack={() => gotoPage("story")}
        bodyPadding="14px 16px calc(20px + var(--safe-bottom))"
      >
        {game.context && (
          <div style={{
            textAlign: "center",
            fontSize: 12.5, fontStyle: "italic",
            color: "rgba(228,224,208,0.52)",
            letterSpacing: "0.04em", lineHeight: 1.85,
            padding: "4px 8px 16px",
            borderBottom: "1px solid rgba(205,178,119,0.12)",
            marginBottom: 16,
          }}>{game.context}</div>
        )}
        <div style={{ color: "var(--paper)", lineHeight: 1.7 }}>
          {children}
        </div>
      </PageShell>

      <Toast text={toast} onDone={() => setToast("")} />
      {overlay}
    </>
  );
}

const BAMBOO_TABLE_IMG = "/images/levels/1/chapters/ch1_beats/bamboo_table.webp";
const slipImg = (word: string) => `/images/levels/1/chapters/ch1_beats/slips/${encodeURIComponent(word)}.webp`;

const classifyWords = {
  病症: ["发热", "咳嗽", "头痛", "失眠", "腹泻", "眩晕", "乏力", "心悸", "胃痛"],
  医理: ["阴阳", "脉象", "气血", "经络", "脏腑", "望诊", "问诊", "病因", "体质"],
  药方: ["汤剂", "抓药", "药材", "配伍", "方剂", "剂量", "膏滋", "药引", "煎药"],
};

const classifyCategories = ["病症", "医理", "药方"] as const;

function BambooPuzzle({ finish, onClassifyRetry, game, best, onBack }: {
  finish: (rank: GameResultRank) => void;
  onClassifyRetry: (retry: boolean) => void;
  game: GameNode;
  best?: GameResultRank;
  onBack: () => void;
}) {
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

  // ── 拖拽分类（Pointer Events，触屏/鼠标通用；与点选并存）──
  type Drag = { id: string; text: string; startX: number; startY: number; x: number; y: number; moved: boolean };
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // 轻点（未移动）时的行为：池中词 → 切换选中；已归类词 → 有选中则归入此类，否则取回
  const handleTap = (id: string, from: string | null) => {
    if (from === null) {
      setSelected(s => (s === id ? null : id));
    } else if (selectedRef.current) {
      const sel = selectedRef.current;
      setPlaced(prev => ({ ...prev, [sel]: from }));
      setSelected(null);
    } else {
      setPlaced(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };
  const handleTapRef = useRef(handleTap);
  handleTapRef.current = handleTap;

  const startDrag = (e: React.PointerEvent, id: string, text: string) => {
    setDrag({ id, text, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false });
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      setDrag(d => d && ({
        ...d, x: e.clientX, y: e.clientY,
        moved: d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6,
      }));
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d) {
        if (d.moved) {
          // 落点所在的分类区（data-cat），__pool__ 表示拖回词语池
          const cat = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)
            ?.closest("[data-cat]")?.getAttribute("data-cat") ?? null;
          if (cat === "__pool__") {
            setPlaced(prev => { const n = { ...prev }; delete n[d.id]; return n; });
            setSelected(null);
          } else if (cat) {
            setPlaced(prev => ({ ...prev, [d.id]: cat }));
            setSelected(null);
          }
        } else {
          handleTapRef.current(d.id, placed[d.id] ?? null);
        }
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null]);

  // 提交后全部正确，渲染 null（等待 useEffect 触发跳转）
  if (submitted && allCorrect) {
    return null;
  }

  // 三分类的色彩主题
  const CAT_THEME: Record<string, { accent: string; bg: string; label: string; chip: string }> = {
    病症: { accent: "#a04040", bg: "rgba(160,64,64,0.06)", label: "rgba(220,130,110,0.92)", chip: "rgba(180,80,60,0.2)" },
    医理: { accent: "#3d8870", bg: "rgba(61,136,112,0.06)", label: "rgba(110,185,162,0.92)", chip: "rgba(60,130,110,0.2)" },
    药方: { accent: "#8a6830", bg: "rgba(138,104,48,0.06)", label: "rgba(200,168,88,0.92)", chip: "rgba(130,100,40,0.2)" },
  };

  const remaining = allWords.filter(w => !placed[w.id]);
  const placedCount = allWords.length - remaining.length;
  const reviewing = submitted && !allCorrect;

  return (
    <div className="bamboo-fs">
      {/* 模糊背景衬底，填满整屏 */}
      <div className="bamboo-fs-bg" style={{ backgroundImage: `url(${BAMBOO_TABLE_IMG})` }} />
      <div className="bamboo-fs-scrim" />

      {/* 顶部浮层：返回 + 标题/说明 + 评级 */}
      <div className="bamboo-top">
        <button className="bamboo-back press" data-sfx="back" onClick={onBack} aria-label="返回">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2 L3 6.5 L8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="bamboo-top-titles">
          <div className="bamboo-top-title">拼 竹 简</div>
          {game.context && <div className="bamboo-top-sub">{game.context}</div>}
        </div>
        <div className="bamboo-top-right">
          {best
            ? <span className="bamboo-badge" style={{ color: RANK_COLOR[best], borderColor: `${RANK_COLOR[best]}55` }}>最佳 · {RANK_LABEL[best]}</span>
            : <span className="bamboo-badge bamboo-badge--new">初 次 挑 战</span>}
        </div>
      </div>

      {/* 居中 16/9 舞台 */}
      <div className="bamboo-stage">
        <img src={BAMBOO_TABLE_IMG} alt="" className="bamboo-stage-bg" draggable={false} />
        {classifyCategories.map((cat, i) => {
          const theme = CAT_THEME[cat] ?? CAT_THEME["病症"];
          const catWords = Object.entries(placed).filter(([, v]) => v === cat).map(([k]) => k);
          const canDrop = !reviewing && (!!selected || !!drag?.moved);
          return (
            <div
              key={cat}
              data-cat={cat}
              className={"bamboo-bin bamboo-bin--" + i + (canDrop ? " can-drop" : "")}
              style={{ ["--bin-accent" as string]: theme.accent } as React.CSSProperties}
              onClick={() => {
                if (reviewing || !selected) return;
                setPlaced(prev => ({ ...prev, [selected]: cat }));
                setSelected(null);
              }}
            >
              <div className="bamboo-bin-label" style={{ color: theme.label }}>
                {cat}<span>{catWords.length}/5</span>
              </div>
              <div className="bamboo-bin-slips">
                {catWords.map(w => {
                  const wrong = reviewing && !classifyWords[cat].includes(w);
                  const right = reviewing && classifyWords[cat].includes(w);
                  return (
                    <button key={w}
                      className={"bamboo-slip bamboo-slip--mini" + (wrong ? " is-wrong" : "") + (right ? " is-right" : "")}
                      onPointerDown={(e) => { if (reviewing) return; e.stopPropagation(); startDrag(e, w, w); }}
                      style={{ touchAction: "none", opacity: drag?.id === w && drag.moved ? 0.4 : 1 }}>
                      <img className="bamboo-slip-img" src={slipImg(w)} alt={w} draggable={false} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 桌面竹简区（也是拖拽的「取回」落区）：透视平铺在桌面上 */}
        <div data-cat="__pool__" className="bamboo-deck">
          {remaining.map(w => (
            <button key={w.id}
              className={"bamboo-slip" + (selected === w.id ? " is-selected" : "")}
              onPointerDown={(e) => startDrag(e, w.id, w.text)}
              style={{ touchAction: "none", opacity: drag?.id === w.id && drag.moved ? 0.4 : 1 }}>
              <img className="bamboo-slip-img" src={slipImg(w.text)} alt={w.text} draggable={false} />
            </button>
          ))}
          {remaining.length === 0 && !reviewing && (
            <div className="bamboo-pool-empty">· 所有竹简已归位 ·</div>
          )}
        </div>
      </div>

      {/* 底部浮层：完成 / 校验 */}
      <div className="bamboo-bottom">
        {reviewing ? (
          <>
            <div className="bamboo-hint bamboo-hint--warn">
              有 {mistakes.length} 处归类有误（红色标出），请选择处理方式。
            </div>
            <div className="bamboo-actions">
              <button className="btn-primary press" onClick={() => {
                setSubmitted(false);
                const toRemove: string[] = [];
                mistakes.forEach(([id]) => toRemove.push(id));
                setPlaced(prev => {
                  const next = { ...prev };
                  toRemove.forEach(id => delete next[id]);
                  return next;
                });
                onClassifyRetry(true);
              }}>继续修正</button>
              <button className="btn-ghost press" onClick={() => {
                onClassifyRetry(false);
                finish("low");
              }}>接受结果</button>
            </div>
          </>
        ) : (
          <>
            <div className="bamboo-hint">把竹简拖进对应的木桶；点选竹简再点木桶也可，点桶中竹简可取回。</div>
            <div className="bamboo-actions">
              <button className="btn-primary press bamboo-submit" disabled={!allPlaced} onClick={() => setSubmitted(true)}>
                {allPlaced ? "完 成 分 类" : `完成分类（${placedCount}/${allWords.length}）`}
              </button>
            </div>
            <div className="bamboo-dev">
              <span className="bamboo-dev-label">开 发 者 跳 过</span>
              {(["high", "mid", "low"] as GameResultRank[]).map(r => (
                <button key={r} className="btn-ghost press bamboo-dev-btn"
                  onClick={() => finish(r)}
                  style={{ borderColor: `${RANK_COLOR[r]}40`, color: RANK_COLOR[r] }}>
                  {RANK_LABEL[r]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 拖拽时跟随指针的竹简浮层 */}
      {drag?.moved && (
        <div className="bamboo-drag-ghost" style={{
          position: "fixed", left: drag.x, top: drag.y,
          transform: "translate(-50%, -115%)", zIndex: 100, pointerEvents: "none",
        }}>
          <img className="bamboo-slip-img" src={slipImg(drag.text)} alt="" draggable={false} />
        </div>
      )}
    </div>
  );
}

// 华容道滑块拼图：4列×5行，目标是让钥匙(1×2横)到达右下角出口(r4,c3)
const COLS = 4;
const ROWS = 5;
const KEY_ID = 1;
const EXIT_ROW = 4; // 钥匙(1×2横)到达 row=4, col=2 占据(r4,c2)(r4,c3)即为出口
const EXIT_COL = 2;
const CELL_SIZE = typeof window !== "undefined" && window.innerWidth >= 1024 ? 92 : 56; // 每格像素大小(桌面端放大)
const WOODENBOX_TABLE_IMG = "/images/levels/1/chapters/ch1_beats/woodenbox_table.webp";

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

function WoodenBox({ finish, hardMode, game, best, onBack }: {
  finish: (rank: GameResultRank) => void;
  hardMode: boolean;
  game: GameNode;
  best?: GameResultRank;
  onBack: () => void;
}) {
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

  const totalW = COLS * CELL_SIZE;
  const totalH = ROWS * CELL_SIZE;
  const diffLabel = hardMode ? "中等版" : "简单版";

  return (
    <div className="wb-fs">
      <div className="wb-fs-bg" style={{ backgroundImage: `url(${WOODENBOX_TABLE_IMG})` }} />
      <div className="wb-fs-scrim" />

      {/* 顶部浮层 */}
      <div className="bamboo-top">
        <button className="bamboo-back press" data-sfx="back" onClick={onBack} aria-label="返回">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2 L3 6.5 L8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="bamboo-top-titles">
          <div className="bamboo-top-title">木 盒 机 关</div>
          {game.context && <div className="bamboo-top-sub">{game.context}</div>}
        </div>
        <div className="bamboo-top-right">
          {best
            ? <span className="bamboo-badge" style={{ color: RANK_COLOR[best], borderColor: `${RANK_COLOR[best]}55` }}>最佳 · {RANK_LABEL[best]}</span>
            : <span className="bamboo-badge bamboo-badge--new">初 次 挑 战</span>}
        </div>
      </div>

      {/* 居中木盘 */}
      <div className="wb-stage">
        <div className="wb-steps">已走 <b>{steps}</b> 步 · {diffLabel}{solved ? " · 已就位" : ""}</div>
        <div
          ref={containerRef}
          className="wb-board"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ width: totalW, height: totalH }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            const isExit = r === ROWS - 1 && c === 3;
            return (
              <div
                key={`bg-${i}`}
                className={"wb-cell" + (isExit ? " wb-cell--exit" : "")}
                style={{ left: c * CELL_SIZE, top: r * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
              >
                {isExit && <span className="wb-exit-mark">出</span>}
              </div>
            );
          })}
          {blocks.map(block => {
            const isKey = block.id === KEY_ID;
            const isDragging = dragging === block.id;
            return (
              <div
                key={block.id}
                onPointerDown={(e) => handlePointerDown(e, block.id)}
                className={"wb-block" + (isKey ? " wb-block--key" : "") + (isDragging ? " is-dragging" : "")}
                style={{
                  left: block.c * CELL_SIZE + 3,
                  top: block.r * CELL_SIZE + 3,
                  width: block.w * CELL_SIZE - 6,
                  height: block.h * CELL_SIZE - 6,
                  transition: isDragging ? "none" : "left 0.12s ease, top 0.12s ease",
                }}
              >
                {isKey && (
                  <svg className="wb-key-icon" viewBox="0 0 24 24" fill="none" width={CELL_SIZE * 0.5} height={CELL_SIZE * 0.5}>
                    <circle cx="8" cy="8" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M11 11 L19 19 M16.5 16.5 L19 14 M19 19 L21.5 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部浮层 */}
      <div className="bamboo-bottom">
        <div className="bamboo-hint">拖动方块，引导金钥匙滑到右下「出」格。步少者，医道精。</div>
        <div className="bamboo-actions">
          <button
            className="btn-primary press bamboo-submit"
            disabled={!solved}
            onClick={() => finish(steps <= rankThresholds.high ? "high" : steps <= rankThresholds.mid ? "mid" : "low")}
          >
            {solved ? "解 开 木 盒" : "把 钥 匙 移 到 出 口"}
          </button>
        </div>
        <div className="bamboo-dev">
          <span className="bamboo-dev-label">开 发 者 跳 过</span>
          {(["high", "mid", "low"] as GameResultRank[]).map(r => (
            <button key={r} className="btn-ghost press bamboo-dev-btn"
              onClick={() => finish(r)}
              style={{ borderColor: `${RANK_COLOR[r]}40`, color: RANK_COLOR[r] }}>
              {RANK_LABEL[r]}
            </button>
          ))}
        </div>
      </div>
    </div>
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
        <div style={instStyle}>先记住三张药方与各自药材，计时结束后凭记忆归整。</div>
        <button className="btn-primary press" onClick={() => setStarted(true)} style={{ width: "100%" }}>开 始 记 忆</button>
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
      <div className="mg-grid-3">
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
  intro, items, correct, finishLabel, finish, hints,
}: {
  intro: string;
  items: string[];
  correct: string[];
  finishLabel: string;
  finish: (rank: GameResultRank) => void;
  hints?: Record<string, string>;
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
      <div style={instStyle}>{intro}</div>
      <div className="dialogue" style={{ margin: "10px 0" }}>
        <div className="dialogue-name">你的排序</div>
        <div>{answer.join(" → ") || "尚未选择"}</div>
      </div>
      <div className="mg-grid-2">
        {pool.map(item => (
          <div key={item}>
            <button className="choice press" onClick={() => choose(item)} style={{ width: "100%" }}>
              <span className="choice-label">{item}</span>
            </button>
            {hints?.[item] && (
              <div style={{
                marginTop: 4, padding: "4px 10px",
                fontSize: 11, fontStyle: "italic",
                color: "rgba(200,168,88,0.85)",
                letterSpacing: "0.03em", lineHeight: 1.6,
                borderLeft: "2px solid rgba(200,168,88,0.5)",
              }}>{hints[item]}</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <button className="btn-ghost press" onClick={reset}>重排</button>
        <button className="btn-primary press" disabled={answer.length !== items.length} onClick={submit}>{finishLabel}</button>
      </div>
    </>
  );
}

// 残歌定界：能救急、可传唱的安全歌诀（阶段一按此顺序排列）
const SONG_SAFE = ["急症先看神与息", "寒热未明莫乱投", "轻症可记寻常法", "重病仍须问医者"];
// 夹在残纸里、不该乱传的重方细节（阶段二须划入「不可入歌」）
const SONG_DANGER = ["三钱半夏急煎服", "针入寸半可回阳", "乌头入酒止痛快", "孩童高热强灌汤"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 残歌定界 —— 两步式玩法（第四章「知识传播的边界」主题）：
 *  ① 残歌定界：把混入的重方/禁忌划入「不可入歌」，安全句留在「可入歌」。
 *  ② 补全歌诀：把留下能入歌的安全残句排成可传唱的次序。
 * 评级：8 句全部归类正确且排序正确 → 高；归类错 ≤2 → 中；否则 → 低。
 */
function SongBoundary({ finish }: { finish: (rank: GameResultRank) => void }) {
  const [phase, setPhase] = useState<"classify" | "order">("classify");
  const classErrorsRef = useRef(0);

  // —— 阶段一：残歌定界（分类）——
  const allVerses = useMemo(() => shuffle([...SONG_SAFE, ...SONG_DANGER]), []);
  const [bins, setBins] = useState<Record<string, "in" | "out">>({});
  const unassigned = allVerses.filter(v => !bins[v]);
  const inList = allVerses.filter(v => bins[v] === "in");
  const outList = allVerses.filter(v => bins[v] === "out");
  // 必须可入歌、不可入歌各 4 句才能进入下一步
  const binsBalanced = inList.length === SONG_SAFE.length && outList.length === SONG_DANGER.length;
  const assign = (v: string, bin: "in" | "out") => setBins(b => ({ ...b, [v]: bin }));
  const unassign = (v: string) => setBins(b => { const n = { ...b }; delete n[v]; return n; });
  const submitClassify = () => {
    let errors = 0;
    for (const v of SONG_SAFE) if (bins[v] !== "in") errors++;
    for (const v of SONG_DANGER) if (bins[v] !== "out") errors++;
    classErrorsRef.current = errors;
    // 用玩家选入「可入歌」的 4 句作为排序素材
    setPool(shuffle(inList));
    setAnswer([]);
    setPhase("order");
  };

  // —— 阶段二：补全歌诀（用玩家选的可入歌 4 句排序）——
  const [pool, setPool] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const chooseOrder = (v: string) => { setPool(p => p.filter(x => x !== v)); setAnswer(a => [...a, v]); };
  const resetOrder = () => { setPool(shuffle(inList)); setAnswer([]); };
  const submitOrder = () => {
    const orderExact = answer.every((x, i) => x === SONG_SAFE[i]);
    const errors = classErrorsRef.current;
    const rank: GameResultRank =
      orderExact && errors === 0 ? "high" : errors <= 2 ? "mid" : "low";
    finish(rank);
  };

  if (phase === "classify") {
    return (
      <>
        <div style={instStyle}>
          玄音的残纸上，救急常识与重方细节混在一处。把能传唱的 4 句放入「可入歌」，危险的剂量、针法、毒药 4 句放入「不可入歌」。
        </div>
        <div className="dialogue" style={{ margin: "10px 0" }}>
          <div className="dialogue-name">你的判断</div>
          <div>{`可入歌 ${inList.length} / ${SONG_SAFE.length} · 不可入歌 ${outList.length} / ${SONG_DANGER.length}`}</div>
        </div>

        {unassigned.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {unassigned.map(v => (
              <div key={v} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px",
                background: "linear-gradient(180deg, rgba(34,30,22,0.7), rgba(20,18,14,0.7))",
                border: "1px solid rgba(205,178,119,0.28)", borderRadius: 2,
              }}>
                <span style={{ flex: 1, fontSize: 14, color: "var(--paper)", letterSpacing: "0.04em" }}>{v}</span>
                <button className="press" onClick={() => assign(v, "in")} style={{
                  padding: "5px 12px", fontSize: 12, letterSpacing: "0.08em",
                  border: "1px solid var(--gold-deep)", borderRadius: 2,
                  background: "rgba(205,178,119,0.12)", color: "var(--gold-pale)",
                }}>入歌</button>
                <button className="press" onClick={() => assign(v, "out")} style={{
                  padding: "5px 12px", fontSize: 12, letterSpacing: "0.08em",
                  border: "1px solid #6e1f18", borderRadius: 2,
                  background: "rgba(110,31,24,0.18)", color: "#d98a7e",
                }}>封存</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <SongBin title="可 入 歌" accent="var(--gold-pale)" border="var(--gold-deep)" list={inList} onTap={unassign} empty="可传唱的句子" />
          <SongBin title="不 可 入 歌" accent="#d98a7e" border="#6e1f18" list={outList} onTap={unassign} empty="须留给医者" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <button className="btn-ghost press" onClick={() => setBins({})}>重新分拣</button>
          <button className="btn-primary press" disabled={!binsBalanced} onClick={submitClassify}>完成定界</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={instStyle}>
        边界已划定。把留下能入歌的句子，排成顺口能传的次序，让它真正被传唱。
      </div>
      <div className="dialogue" style={{ margin: "10px 0" }}>
        <div className="dialogue-name">歌诀</div>
        <div>{answer.join(" → ") || "尚未排定"}</div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {pool.map(v => (
          <button key={v} className="choice press" onClick={() => chooseOrder(v)} style={{ width: "100%" }}>
            <span className="choice-label">{v}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <button className="btn-ghost press" onClick={resetOrder}>重排</button>
        <button className="btn-primary press" disabled={answer.length !== inList.length} onClick={submitOrder}>
          定稿传唱
        </button>
      </div>
    </>
  );
}

/** 残歌定界的「可入歌 / 不可入歌」分区；点击已归类的句子可退回待判区。 */
function SongBin({ title, accent, border, list, onTap, empty }: {
  title: string; accent: string; border: string;
  list: string[]; onTap: (v: string) => void; empty: string;
}) {
  return (
    <div style={{
      minHeight: 96, padding: "8px 8px 10px",
      border: `1px solid ${border}`, borderRadius: 3,
      background: `${border}14`,
    }}>
      <div style={{ fontSize: 11, letterSpacing: "0.2em", color: accent, textAlign: "center", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "grid", gap: 6 }}>
        {list.length === 0
          ? <div style={{ fontSize: 11, color: "rgba(228,224,208,0.3)", textAlign: "center", padding: "10px 0", fontStyle: "italic" }}>{empty}</div>
          : list.map(v => (
            <button key={v} className="press" onClick={() => onTap(v)} style={{
              width: "100%", padding: "6px 8px", fontSize: 12.5,
              border: `1px solid ${border}`, borderRadius: 2,
              background: "rgba(20,18,14,0.5)", color: "var(--paper)", textAlign: "left",
            }}>{v}</button>
          ))}
      </div>
    </div>
  );
}

export function MiniGamePage({ state, setState, gotoPage }: MiniGamePageProps) {
  const game = allGameNodes().find(g => g.id === state.activeGameId) || allGameNodes()[0];
  const [toast, setToast] = useState("");
  const [localClassifyRetry, setLocalClassifyRetry] = useState<boolean | null>(state.classifyRetry);
  const [feedback, setFeedback] = useState<GameResultRank | null>(null);
  const [retryKey] = useState(0);

  // 华容道难度：classifyRetry=true(继续修正) → 简单, classifyRetry=false(退出) → 中等
  const woodenBoxHard = localClassifyRetry === false;

  const finish = (rank: GameResultRank) => {
    playSfx("unlock"); // 完成机关/游戏的成功音（优先级高于点击 tap，会在 30ms 内胜出）
    let ns = applyNarrativeResult(applyResult(state, game, rank), game, rank);
    // 木盒夹层：困难难度高完成度=藏卷成功(found)，其余完成=险些被搜出(missed)
    if (game.kind === "woodenBox") {
      // 藏卷成功只看完成度（高完成度=藏好夹层），与难易无关；
      // 之前误加了 woodenBoxHard 条件，导致易模式即使高分也判为藏匿失败。
      const found = rank === "high";
      ns = {
        ...ns,
        boxCompartment: found ? "found" : "missed",
        searchPressure: Math.max(0, (ns.searchPressure || 0) + (found ? 0 : 1)),
      };
    }
    setState(ns);
    saveState(ns);
    setFeedback(rank);
  };

  const handleClassifyRetry = (retry: boolean) => {
    setLocalClassifyRetry(retry);
    // 持久化到 state
    const ns = { ...state, classifyRetry: retry };
    setState(ns);
    saveState(ns);
  };

  const locked = game.requiredItem && !state.items.includes(game.requiredItem);

  // 拼竹简：全屏沉浸场景（脱离 PageShell 卡片）
  if (game.kind === "bambooPuzzle" && !locked) {
    return (
      <>
        <BambooPuzzle
          finish={finish}
          onClassifyRetry={handleClassifyRetry}
          game={game}
          best={state.gameResults[game.id]?.best}
          onBack={() => gotoPage("story")}
        />
        <Toast text={toast} onDone={() => setToast("")} />
        {feedback !== null && (
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={() => gotoPage("story")} />
        )}
      </>
    );
  }

  // 木盒机关：全屏沉浸场景
  if (game.kind === "woodenBox" && !locked) {
    return (
      <>
        <WoodenBox
          finish={finish}
          hardMode={woodenBoxHard}
          game={game}
          best={state.gameResults[game.id]?.best}
          onBack={() => gotoPage("story")}
        />
        <Toast text={toast} onDone={() => setToast("")} />
        {feedback !== null && (
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={() => gotoPage("story")} />
        )}
      </>
    );
  }

  let body: React.ReactNode;
  if (locked) {
    body = <p>尚未获得进入此机关所需之物。</p>;
  } else if (game.kind === "herbMemory") {
    body = <HerbMemory key={retryKey} finish={finish} />;
  } else if (game.kind === "caseTriage") {
    body = (
      <SimpleOrderGame
        key={retryKey}
        intro="三人候诊，不论身份贵贱——只看谁更需要这双手，由急至缓排定顺序。"
        items={["军士：外伤失血，尚可止血", "孩童：高热惊厥，需立刻处置", "老仆：久咳体虚，可稍后调养"]}
        correct={["孩童：高热惊厥，需立刻处置", "军士：外伤失血，尚可止血", "老仆：久咳体虚，可稍后调养"]}
        finishLabel="提交病案"
        finish={finish}
        hints={
          state.gameResults["herb_memory"]?.best === "high"
            ? { "孩童：高热惊厥，需立刻处置": "陈伯药签：此症先固住阳气，切忌猛灌汤药——街市上那个孩子，也是这样救回来的。" }
            : undefined
        }
      />
    );
  } else {
    body = <SongBoundary key={retryKey} finish={finish} />;
  }

  return (
    <Shell
      game={game} state={state} gotoPage={gotoPage}
      toast={toast} setToast={setToast}
      overlay={feedback !== null && (
        <GameFeedbackOverlay
          rank={feedback}
          game={game}
          onDismiss={() => gotoPage("story")}
        />
      )}
    >
      {body}
      {!locked && (
        <div style={{
          marginTop: 20, padding: "10px 0",
          borderTop: "1px solid rgba(228,224,208,0.12)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 9, color: "rgba(228,224,208,0.3)",
            letterSpacing: "0.2em", marginBottom: 8,
          }}>开 发 者 跳 过</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {(["high", "mid", "low"] as GameResultRank[]).map(r => (
              <button
                key={r}
                className="btn-ghost press"
                onClick={() => finish(r)}
                style={{
                  minWidth: 56, padding: "6px 14px",
                  fontSize: 11, letterSpacing: "0.12em",
                  borderColor: `${RANK_COLOR[r]}40`,
                  color: RANK_COLOR[r],
                }}
              >{RANK_LABEL[r]}</button>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}

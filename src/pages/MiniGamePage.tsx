import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORY, ITEMS, type ItemDef } from "../data";
import type { GameNode, GameResultRank, GameState } from "../data/types";
import type { PageKey } from "../lib/routes";
import { saveState } from "../lib/storage";
import { playSfx } from "../lib/audio";
import { Toast, PageShell, diffValues, type ValueDelta } from "../components";

interface MiniGamePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
  onValueDeltas?: (d: ValueDelta[]) => void;
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

// 各小游戏对「数值」的按最佳成绩贡献函数。实际写入用 delta=新-旧，
// 既保证重玩幂等(刷高会提升、重玩不反复叠加)，又能与「对白选择的累加」共存于同一字段。
type RankContrib = (r: GameResultRank) => number;
const skillContrib: RankContrib = r => (r === "high" ? 1 : r === "low" ? -1 : 0); // 技能/信任：高+1/低-1/中0
const tendContrib: RankContrib = r => (r === "high" ? 2 : r === "mid" ? 1 : 0);   // 倾向：高2/中1/低0
const lowPressure: RankContrib = r => (r === "low" ? 1 : 0);                       // 低分加搜查压力
const boxPressure: RankContrib = r => (r === "high" ? 0 : 1);                      // 木盒未藏稳(非高)加压
const huatuoHigh: RankContrib = r => (r === "high" ? 1 : 0);                       // 华佗羁绊(小游戏封顶+1)

interface GameValueEffect { field: keyof GameState; contrib: RankContrib; }
const GAME_VALUE_EFFECTS: Record<string, GameValueEffect[]> = {
  bamboo_puzzle: [
    { field: "medical_skill", contrib: skillContrib },
    { field: "record_tendency", contrib: r => (r === "low" ? 0 : 1) },
    { field: "huatuo_trust", contrib: huatuoHigh },
  ],
  wooden_box: [
    { field: "asked_heart", contrib: skillContrib },
    { field: "searchPressure", contrib: boxPressure },
    { field: "huatuo_trust", contrib: huatuoHigh },
  ],
  herb_memory: [
    { field: "chenbo_trust", contrib: skillContrib },
    { field: "record_tendency", contrib: tendContrib },
    { field: "searchPressure", contrib: lowPressure },
  ],
  case_triage: [
    { field: "wangji_trust", contrib: skillContrib },
    { field: "system_tendency", contrib: tendContrib },
    { field: "searchPressure", contrib: lowPressure },
  ],
  song_formula: [
    { field: "xuanyin_trust", contrib: skillContrib },
    { field: "spread_tendency", contrib: tendContrib },
    { field: "searchPressure", contrib: lowPressure },
  ],
};

function applyResult(state: GameState, game: GameNode, rank: GameResultRank): GameState {
  const prev = state.gameResults[game.id];
  const oldBest = prev?.best;
  const best = !prev || RANK_WEIGHT[rank] > RANK_WEIGHT[prev.best] ? rank : prev.best;
  const next: GameState = {
    ...state,
    items: addUnique(addUnique(state.items, game.unlockItem), game.reward.item),
    gameResults: {
      ...state.gameResults,
      [game.id]: { best, attempts: (prev?.attempts || 0) + 1, completed: true },
    },
  };
  // 数值：按「最佳成绩」算 delta=新-旧后累加，幂等且可与对白累加叠加。
  const map = next as unknown as Record<string, number>;
  for (const eff of GAME_VALUE_EFFECTS[game.id] ?? []) {
    const delta = eff.contrib(best) - (oldBest ? eff.contrib(oldBest) : 0);
    if (delta === 0) continue;
    const cur = Number(map[eff.field] || 0);
    map[eff.field] = eff.field === "searchPressure" ? Math.max(0, cur + delta) : cur + delta;
  }
  return next;
}

// 小游戏的叙事副作用：仅发放「质量物品」(分数决定残页/病案/歌页的完整度)。数值已统一在 applyResult 处理。
function applyNarrativeResult(state: GameState, game: GameNode, rank: GameResultRank): GameState {
  let next = { ...state };

  if (game.id === "herb_memory") {
    const qualityItem =
      rank === "high" ? "chenbo_prescription_full" :
        rank === "mid" ? "chenbo_prescription_partial" :
          "chenbo_prescription_stained";
    next = { ...next, items: addUnique(next.items, qualityItem) };
  }

  if (game.id === "case_triage") {
    const qualityItem =
      rank === "high" ? "case_record_full" :
        rank === "mid" ? "case_record_partial" :
          "case_record_flawed";
    next = { ...next, items: addItems(next.items, [qualityItem, "wangji_fake_doc"]) };
  }

  if (game.id === "song_formula") {
    const qualityItem =
      rank === "high" ? "xuanyin_song_page_complete" :
        rank === "mid" ? "xuanyin_song_page_corrected" :
          "xuanyin_song_page_unclean";
    const extraItems = rank === "high" ? [qualityItem, "forbidden_record"] : [qualityItem];
    next = { ...next, items: addItems(next.items, extraItems) };
  }

  return next;
}

// ── 游戏完成反馈数据 ───────────────────────────────────────────
const GAME_FEEDBACK: Record<string, Record<GameResultRank, { title: string; text: string }>> = {
  bambooPuzzle: {
    high: { title: "竹简归位", text: "华佗说：「书能拼起，只是第一步。但你摸到了它的脉络——字句之间有一套活的逻辑。」" },
    mid: { title: "大半复原", text: "华佗说：「差一点。再想想字句背后的意思。医书不是目录，每一排都有它的位置。」" },
    low: { title: "残缺犹存", text: "华佗说：「这就是残卷为何难传的原因。能拼起的，不只是竹简，是看懂它的人。」" },
  },
  woodenBox: {
    high: { title: "机关已解", text: "华佗说：「能用最少的代价解开困局，这才是医道——不浪费，不强求，走最短的路。」" },
    mid: { title: "峰回路转", text: "华佗说：「能出来就好。多走了些弯路，但弯路也是路，你走过了。」" },
    low: { title: "曲折出关", text: "华佗说：「步步错落，靠摸索才得出路。不要紧——每一次试探都刻进了手里。」" },
  },
  herbMemory: {
    high: { title: "药案整理完备", text: "华佗说：「认药如识人，你记住了它们各自的模样。一味草药，背后是无数人的试验。」" },
    mid: { title: "大体整妥", text: "华佗说：「药名好记，药性需亲历方知。你记住了大半，剩下的靠经验来补。」" },
    low: { title: "药案残缺", text: "华佗说：「草药不认识你，你也需要先认识它们。不懂时，就先不用——这也是一条规矩。」" },
  },
  caseTriage: {
    high: { title: "病案顺序正确", text: "华佗说：「医者不论贵贱，只看谁更需要这双手。你做到了这一点。」" },
    mid: { title: "轻重有序", text: "华佗说：「有时候，多看一眼就是多一条命。你快到了，下次再准一点。」" },
    low: { title: "顺序待正", text: "华佗说：「把人命排出轻重，这是医者最难过的关。规则只有一条：看谁更需要被救。」" },
  },
  songFormula: {
    high: { title: "歌成定界", text: "玄音看着你划去的几句重方，轻轻点头。「原来传医理，不是唱得越多越好。能救急的，让百姓记住；会误人的，留给医者。」歌声从巷尾散开——你第一次觉得，纸以外也能有书。" },
    mid: { title: "界限微差", text: "玄音哼了两句又停下。「大体能传，可还有一两句拿不准。歌可以快，医理不能乱——再想想哪些该留下。」" },
    low: { title: "界限未明", text: "玄音刚拨响琴弦，又按住了弦。「这一句若传开，怕是会有人照着乱用。小郎中，歌可以快，医理不能乱。」" },
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
        {rank === "high" ? "优" : rank === "mid" ? "良" : "勉"}
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
        fontSize: 26, color: "var(--gold-pale)",
        letterSpacing: "0.22em", textAlign: "center",
        marginBottom: 16, animationDelay: "180ms",
      }}>{fb.title}</div>
      <div className="fade-in" style={{
        fontSize: 16.5, color: "rgba(228,224,208,0.82)",
        lineHeight: 2, letterSpacing: "0.04em",
        textAlign: "center", maxWidth: 360,
        marginBottom: 42, fontStyle: "italic",
        animationDelay: "320ms",
      }}>{fb.text}</div>
      <div className="fade-in" style={{
        fontSize: 14, color: "rgba(228,224,208,0.4)",
        letterSpacing: "0.35em", animationDelay: "550ms",
      }}>轻 触 继 续</div>
    </div>
  );
}

/** 小游戏结算后，若获得带图物品，复用「获得物品弹窗」展示插图（与剧情台词触发的同款）。 */
function GameItemModal({ items, onDismiss }: { items: ItemDef[]; onDismiss: () => void }) {
  return (
    <div className="item-modal-backdrop" onClick={onDismiss} style={{ zIndex: 210 }}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="item-modal-eyebrow">获 得 物 品</div>
        <div className="item-modal-list">
          {items.map(it => (
            <div key={it.id} className="item-modal-entry">
              <div className="item-modal-icon">
                {it.image
                  ? <img src={it.image} alt={it.name} />
                  : <span className="cb-item-seal">物</span>}
              </div>
              <div className="item-modal-info">
                <div className="item-modal-name">{it.name}</div>
                {it.desc && <div className="item-modal-desc">{it.desc}</div>}
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary press item-modal-btn" onClick={onDismiss}>收 下</button>
      </div>
    </div>
  );
}

const RANK_COLOR: Record<GameResultRank, string> = {
  high: "#5fa892",
  mid: "#cdb277",
  low: "rgba(228,224,208,0.55)",
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
            fontSize: 15, fontStyle: "italic",
            color: "rgba(228,224,208,0.58)",
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

export const CASE_TRIAGE_IMG = "/images/levels/1/chapters/ch3_beats/ch3_07_three_cases.webp";

const CASE_FILES = [
  { id: "child", name: "孩童", img: "/images/levels/1/chapters/ch3_beats/cases/case_child.webp" },
  { id: "soldier", name: "军士", img: "/images/levels/1/chapters/ch3_beats/cases/case_soldier.webp" },
  { id: "servant", name: "老仆", img: "/images/levels/1/chapters/ch3_beats/cases/case_servant.webp" },
];
const CASE_TRIAGE_CORRECT = ["child", "soldier", "servant"];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 曹府查案：全屏沉浸场景，依次点选病案文件排出救治顺序（复用 .clinic-fs / .bamboo-top/.bamboo-bottom 浮层）。 */
function CaseTriage({ finish, game, best, onBack }: {
  finish: (rank: GameResultRank) => void;
  game: GameNode;
  best?: GameResultRank;
  onBack: () => void;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [files] = useState(() => shuffled(CASE_FILES));

  const toggle = (id: string) => {
    setOrder(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  };
  const reset = () => setOrder([]);
  const submit = () => {
    const exact = order.length === CASE_TRIAGE_CORRECT.length && order.every((x, i) => x === CASE_TRIAGE_CORRECT[i]);
    const firstTwo = order.slice(0, 2).every((x, i) => x === CASE_TRIAGE_CORRECT[i]);
    finish(exact ? "high" : firstTwo ? "mid" : "low");
  };

  return (
    <div className="clinic-fs">
      <div className="clinic-fs-bg" style={{ backgroundImage: `url(${CASE_TRIAGE_IMG})` }} />
      <div className="clinic-fs-scrim" />

      <div className="bamboo-top">
        <button className="bamboo-back press" data-sfx="back" onClick={onBack} aria-label="返回">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2 L3 6.5 L8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="bamboo-top-titles">
          <div className="bamboo-top-title">曹 府 查 案</div>
          {game.context && <div className="bamboo-top-sub">{game.context}</div>}
        </div>
        <div className="bamboo-top-right">
          {best
            ? <span className="bamboo-badge" style={{ color: RANK_COLOR[best], borderColor: `${RANK_COLOR[best]}55` }}>最佳 · {RANK_LABEL[best]}</span>
            : <span className="bamboo-badge bamboo-badge--new">初 次 挑 战</span>}
        </div>
      </div>

      <div className="clinic-stage">
        <div className="clinic-card clinic-card--intro">
          <div className="clinic-card-title">由 急 至 缓</div>
          <div className="clinic-card-text">三人候诊，不论身份贵贱——依次点选病案，按最先救治的顺序排列。</div>
        </div>

        <div className="case-triage-row">
          {files.map(c => {
            const idx = order.indexOf(c.id);
            return (
              <div key={c.id} className="case-file-wrap">
                <button
                  className={"case-file press" + (idx >= 0 ? " is-picked" : "")}
                  onClick={() => toggle(c.id)}
                >
                  <div className="case-file-frame">
                    <img src={c.img} alt="" className="case-file-img" draggable={false} />
                    {idx >= 0 && <span className="case-file-badge">{idx + 1}</span>}
                  </div>
                  <div className="case-file-caption">
                    <strong>{c.name}</strong>
                  </div>
                </button>
                <img src={c.img} alt="" className="case-file-zoom" draggable={false} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="bamboo-bottom">
        <div className="bamboo-actions">
          <button className="btn-ghost press" onClick={reset}>重 排</button>
          <button className="btn-primary press bamboo-submit" disabled={order.length !== CASE_FILES.length} onClick={submit}>
            提 交 病 案
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
export const BAMBOO_TABLE_IMG = "/images/levels/1/chapters/ch1_beats/bamboo_table.webp";
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
export const WOODENBOX_TABLE_IMG = "/images/levels/1/chapters/ch1_beats/woodenbox_table.webp";

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
    { id: 1, w: 2, h: 1, r: 1, c: 1 }, // 钥匙 横1×2
    { id: 2, w: 2, h: 1, r: 0, c: 0 }, // 木A 横2×1
    { id: 3, w: 2, h: 1, r: 0, c: 2 }, // 木B 横2×1
    { id: 4, w: 1, h: 2, r: 1, c: 0 }, // 木C 竖1×2
    { id: 5, w: 1, h: 2, r: 1, c: 3 }, // 木D 竖1×2
    { id: 6, w: 1, h: 1, r: 2, c: 1 }, // 木E 1×1
    { id: 7, w: 1, h: 2, r: 3, c: 0 }, // 木F 竖1×2
    { id: 8, w: 2, h: 1, r: 3, c: 2 }, // 木G 横2×1
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
    { id: 1, w: 2, h: 1, r: 1, c: 1 }, // 钥匙 横1×2
    { id: 2, w: 2, h: 1, r: 0, c: 0 }, // 木A 横2×1
    { id: 3, w: 2, h: 1, r: 0, c: 2 }, // 木B 横2×1
    { id: 4, w: 1, h: 2, r: 1, c: 0 }, // 木C 竖1×2
    { id: 5, w: 1, h: 2, r: 1, c: 3 }, // 木D 竖1×2
    { id: 6, w: 1, h: 1, r: 2, c: 1 }, // 木E 1×1
    { id: 7, w: 2, h: 1, r: 3, c: 2 }, // 木F 横2×1
    { id: 8, w: 1, h: 2, r: 3, c: 0 }, // 木G 竖1×2
    { id: 9, w: 1, h: 1, r: 4, c: 2 }, // 木H 1×1
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

export const CLINIC_TABLE_IMG = "/images/levels/1/chapters/ch2_beats/clinic_table.webp";

const prescriptions = [
  { name: "桂枝汤", herbs: ["桂枝", "芍药", "甘草", "生姜", "大枣"], img: "/images/levels/1/chapters/ch2_beats/clinic_herbs_guizhi.webp" },
  { name: "四君子汤", herbs: ["人参", "白术", "茯苓", "甘草"], img: "/images/levels/1/chapters/ch2_beats/clinic_herbs_sijunzi.webp" },
  { name: "生脉散", herbs: ["人参", "麦冬", "五味子"], img: "/images/levels/1/chapters/ch2_beats/clinic_herbs_shengmai.webp" },
];

/** 配药救急：全屏沉浸场景（药庐场景衬底，复用 .bamboo-top/.bamboo-bottom 浮层）。 */
function HerbMemory({ finish, game, best, onBack }: {
  finish: (rank: GameResultRank) => void;
  game: GameNode;
  best?: GameResultRank;
  onBack: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const herbs = Array.from(new Set(prescriptions.flatMap(p => p.herbs))).sort();

  const placeHerb = (presc: string, herb: string) => {
    setPlaced(prev => {
      const list = prev[presc] || [];
      return list.includes(herb) ? prev : { ...prev, [presc]: [...list, herb] };
    });
  };
  const removeHerb = (presc: string, herb: string) => {
    setPlaced(prev => ({ ...prev, [presc]: (prev[presc] || []).filter(h => h !== herb) }));
  };

  useEffect(() => {
    if (!started || remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining(v => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [started, remaining]);

  const memorizing = started && remaining > 0;
  const assembling = started && remaining <= 0;
  const placedCount = Object.values(placed).reduce((n, l) => n + l.length, 0);
  const totalHerbCount = prescriptions.reduce((n, p) => n + p.herbs.length, 0);

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
    <div className="clinic-fs" >
      <div className="clinic-fs-bg" style={{ backgroundImage: `url(${CLINIC_TABLE_IMG})` }} />
      <div className="clinic-fs-scrim" />

      <div className="bamboo-top">
        <button className="bamboo-back press" data-sfx="back" onClick={onBack} aria-label="返回">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2 L3 6.5 L8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="bamboo-top-titles">
          <div className="bamboo-top-title">配 药 救 急</div>
          {game.context && <div className="bamboo-top-sub">{game.context}</div>}
        </div>
        <div className="bamboo-top-right">
          {best
            ? <span className="bamboo-badge" style={{ color: RANK_COLOR[best], borderColor: `${RANK_COLOR[best]}55` }}>最佳 · {RANK_LABEL[best]}</span>
            : <span className="bamboo-badge bamboo-badge--new">初 次 挑 战</span>}
        </div>
      </div>

      <div className="clinic-stage">
        {!started && (
          <div className="clinic-card clinic-card--intro">
            <div className="clinic-card-title">先 记 住 药 方</div>
            <div className="clinic-card-text">三张药方与各自药材，计时结束后凭记忆归整。</div>
          </div>
        )}

        {memorizing && (
          <>
            <div className="clinic-timer">记 忆 时 间 · {remaining} 秒</div>
            <div className="clinic-cards">
              {prescriptions.map(p => (
                <div key={p.name} className="clinic-card clinic-card--herb">
                  <img src={p.img} alt="" className="clinic-card-thumb" draggable={false} />
                  <div className="clinic-card-body">
                    <div className="clinic-card-name">{p.name}</div>
                    <div className="clinic-card-herbs">{p.herbs.join("、")}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {assembling && (
          <>
            <div className="clinic-herb-pool">
              {herbs.map(h => (
                <button key={h}
                  className={"clinic-herb-tag press" + (selected === h ? " is-selected" : "")}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", h); setSelected(h); }}
                  onClick={() => setSelected(h)}>{h}</button>
              ))}
            </div>
            <div className="bamboo-hint">拖拽药材到药方框，或先点选药材再点药方框；点已配药材可取出重置。</div>
            <div className="clinic-cards clinic-cards--target">
              {prescriptions.map(p => (
                <div key={p.name}
                  role="button"
                  tabIndex={0}
                  className={"clinic-card clinic-card--herb clinic-card--target press" + (dragOver === p.name ? " is-dragover" : "")}
                  onClick={() => {
                    if (!selected) return;
                    placeHerb(p.name, selected);
                    setSelected(null);
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(p.name); }}
                  onDragLeave={() => setDragOver(prev => (prev === p.name ? null : prev))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const h = e.dataTransfer.getData("text/plain");
                    if (h) placeHerb(p.name, h);
                    setSelected(null);
                    setDragOver(null);
                  }}
                >
                  <img src={p.img} alt="" className="clinic-card-thumb" draggable={false} />
                  <div className="clinic-card-body">
                    <div className="clinic-card-name">{p.name}</div>
                    <div className="clinic-card-herbs clinic-card-herbs--placed">
                      {(placed[p.name] || []).length ? (
                        <div className="clinic-placed-chips">
                          {(placed[p.name] || []).map(h => (
                            <span key={h} className="clinic-placed-chip"
                              onClick={(e) => { e.stopPropagation(); removeHerb(p.name, h); }}>
                              {h}<span className="clinic-placed-chip-x">×</span>
                            </span>
                          ))}
                        </div>
                      ) : "待 整 理"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bamboo-bottom">
        {!started && (
          <div className="bamboo-actions">
            <button className="btn-primary press bamboo-submit" onClick={() => setStarted(true)}>开 始 记 忆</button>
          </div>
        )}

        {memorizing && (
          <div className="bamboo-actions">
            <button className="btn-ghost press bamboo-submit" onClick={() => setRemaining(0)}>开 始 整 理（跳 过 记 忆）</button>
          </div>
        )}

        {assembling && (
          <>
            <div className="bamboo-actions">
              <button className="btn-primary press bamboo-submit" onClick={submit}>
                提 交 验 方（{placedCount}/{totalHerbCount}）
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
    </div>
  );
}

// 残歌定界：能救急、可传唱的安全歌诀（阶段一按此顺序排列）
const SONG_SAFE = ["急症先看神与息", "寒热未明莫乱投", "轻症可记寻常法", "重病仍须问医者"];
// 夹在残纸里、不该乱传的重方细节（阶段二须划入「不可入歌」）
const SONG_DANGER = ["三钱半夏急煎服", "针入寸半可回阳", "乌头入酒止痛快", "孩童高热强灌汤"];

export const SONG_BG_CLASSIFY = "/images/levels/1/chapters/ch4_beats/scene_game3_classify_blank.webp";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 8 句残句的贴图：独立的干净卷条素材（已抠透明底），而非从透视实拍图裁切
const SONG_SLIP_DIR = "/images/levels/1/chapters/ch4_beats/song_slips";
const SONG_SLIP_IMG: Record<string, string> = {
  "急症先看神与息": `${SONG_SLIP_DIR}/slip_safe_0.webp`,
  "寒热未明莫乱投": `${SONG_SLIP_DIR}/slip_safe_1.webp`,
  "轻症可记寻常法": `${SONG_SLIP_DIR}/slip_safe_2.webp`,
  "重病仍须问医者": `${SONG_SLIP_DIR}/slip_safe_3.webp`,
  "三钱半夏急煎服": `${SONG_SLIP_DIR}/slip_danger_0.webp`,
  "针入寸半可回阳": `${SONG_SLIP_DIR}/slip_danger_1.webp`,
  "乌头入酒止痛快": `${SONG_SLIP_DIR}/slip_danger_2.webp`,
  "孩童高热强灌汤": `${SONG_SLIP_DIR}/slip_danger_3.webp`,
};

/** 残歌定界/补全歌诀的卷条：独立的残句贴图（透明底卷纸），随拖拽/选中状态变化。 */
function SongSlip({ text, mini, dim, selected, onPointerDown, badge }: {
  text: string;
  mini?: boolean;
  dim?: boolean;
  selected?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  badge?: number;
}) {
  return (
    <button
      className={"song-slip" + (mini ? " song-slip--mini" : "") + (selected ? " is-selected" : "")}
      style={{ touchAction: "none", opacity: dim ? 0.35 : 1 }}
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()} // 落点判定全部走 pointerup；阻止 click 再冒泡触发容器的 onClick
    >
      {badge !== undefined && <span className="song-slip-badge">{badge}</span>}
      <img className="song-slip-img" src={SONG_SLIP_IMG[text]} alt={text} draggable={false} />
    </button>
  );
}

/**
 * 残歌定界（第四章「知识传播的边界」主题），全屏沉浸场景：
 * 把混入的重方/禁忌划入「不可入歌」，安全句留在「可入歌」（拖拽或点选），各侧最多 4 句。
 * 评级：8 句全部归类正确 → 高；归类错 ≤2 → 中；否则 → 低。
 */
function SongBoundary({ finish, game, best, onBack }: {
  finish: (rank: GameResultRank) => void;
  game: GameNode;
  best?: GameResultRank;
  onBack: () => void;
}) {
  const allVerses = useMemo(() => shuffle([...SONG_SAFE, ...SONG_DANGER]), []);
  const [bins, setBins] = useState<Record<string, "in" | "out">>({});
  const unassigned = allVerses.filter(v => !bins[v]);
  const inList = allVerses.filter(v => bins[v] === "in");
  const outList = allVerses.filter(v => bins[v] === "out");
  // 必须可入歌、不可入歌各 4 句才能定界
  const binsBalanced = inList.length === SONG_SAFE.length && outList.length === SONG_DANGER.length;
  const assign = (v: string, bin: "in" | "out" | null) => setBins(b => {
    if (bin === "in" && inList.length >= SONG_SAFE.length && b[v] !== "in") return b;
    if (bin === "out" && outList.length >= SONG_DANGER.length && b[v] !== "out") return b;
    const n = { ...b };
    if (bin) n[v] = bin; else delete n[v];
    return n;
  });
  const submitClassify = () => {
    let errors = 0;
    for (const v of SONG_SAFE) if (bins[v] !== "in") errors++;
    for (const v of SONG_DANGER) if (bins[v] !== "out") errors++;
    const rank: GameResultRank = errors === 0 ? "high" : errors <= 2 ? "mid" : "low";
    finish(rank);
  };

  // ── 点选 + 拖拽并存（Pointer Events，触屏/鼠标通用）──
  // 点选：先点一句（高亮选中），再点目标框（可入歌/不可入歌）完成归类；点已归类的句子则退回待判。
  // 拖拽：直接把句子拖到目标框上即可，逻辑与点选共用同一落点判定。
  const [selected, setSelected] = useState<string | null>(null);

  type Drag = { v: string; from: string | null; startX: number; startY: number; x: number; y: number; moved: boolean };
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  // 轻点（未移动）时的行为：待判池中的句子 → 切换选中；已归类的句子 → 有选中则把选中句子归入此处，否则把自己退回。
  const handleTap = (v: string, from: string | null) => {
    if (from === null) {
      setSelected(s => (s === v ? null : v));
    } else if (selected) {
      assign(selected, from as "in" | "out");
      setSelected(null);
    } else {
      assign(v, null);
    }
  };
  const handleTapRef = useRef(handleTap);
  handleTapRef.current = handleTap;

  const startDrag = (e: React.PointerEvent, v: string, from: string | null) => {
    setDrag({ v, from, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false });
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
          const cat = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)
            ?.closest("[data-cat]")?.getAttribute("data-cat") ?? null;
          if (cat === "__pool__") assign(d.v, null);
          else if (cat === "in" || cat === "out") { assign(d.v, cat); setSelected(null); }
        } else {
          handleTapRef.current(d.v, d.from);
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

  const bgImg = SONG_BG_CLASSIFY;
  const activeVerse = drag?.moved ? drag.v : selected;

  return (
    <div className="song-fs">
      <div className="bamboo-fs-bg" style={{ backgroundImage: `url(${bgImg})` }} />
      <div className="bamboo-fs-scrim" />

      <div className="bamboo-top">
        <button className="bamboo-back press" data-sfx="back" onClick={onBack} aria-label="返回">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2 L3 6.5 L8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="bamboo-top-titles">
          <div className="bamboo-top-title">{game.name}</div>
          <div className="bamboo-top-sub">{game.context}</div>
        </div>
        <div className="bamboo-top-right">
          {best
            ? <span className="bamboo-badge" style={{ color: RANK_COLOR[best], borderColor: `${RANK_COLOR[best]}55` }}>最佳 · {RANK_LABEL[best]}</span>
            : <span className="bamboo-badge bamboo-badge--new">初 次 挑 战</span>}
        </div>
      </div>

      <div className="song-stage">
        <img src={bgImg} alt="" className="bamboo-stage-bg" draggable={false} />

        <div data-cat="__pool__" className="song-pool">
          {unassigned.length === 0
            ? <div className="bamboo-pool-empty">· 残句已全部分拣 ·</div>
            : unassigned.map(v => (
              <SongSlip key={v} text={v} selected={selected === v} dim={drag?.v === v && drag.moved}
                onPointerDown={(e) => startDrag(e, v, null)} />
            ))}
        </div>

        <div data-cat="in" className={"song-bin song-bin--in" + (activeVerse && (inList.length < SONG_SAFE.length || bins[activeVerse] === "in") ? " can-drop" : "")}
          onClick={() => { if (selected) { assign(selected, "in"); setSelected(null); } }}>
          <div className="song-bin-slips">
            {inList.map(v => (
              <SongSlip key={v} text={v} mini dim={drag?.v === v && drag.moved}
                onPointerDown={(e) => { e.stopPropagation(); startDrag(e, v, "in"); }} />
            ))}
          </div>
          <div className="song-bin-label">
            <span className="song-bin-label-text">可入歌</span>
            <span>{inList.length}/{SONG_SAFE.length}</span>
          </div>
        </div>

        <div data-cat="out" className={"song-bin song-bin--out" + (activeVerse && (outList.length < SONG_DANGER.length || bins[activeVerse] === "out") ? " can-drop" : "")}
          onClick={() => { if (selected) { assign(selected, "out"); setSelected(null); } }}>
          <div className="song-bin-slips">
            {outList.map(v => (
              <SongSlip key={v} text={v} mini dim={drag?.v === v && drag.moved}
                onPointerDown={(e) => { e.stopPropagation(); startDrag(e, v, "out"); }} />
            ))}
          </div>
          <div className="song-bin-label">
            <span className="song-bin-label-text">不可入歌</span>
            <span>{outList.length}/{SONG_DANGER.length}</span>
          </div>
        </div>
      </div>

      <div className="bamboo-bottom">
        <div className="bamboo-hint">
          {`可入歌 ${inList.length} / ${SONG_SAFE.length} · 不可入歌 ${outList.length} / ${SONG_DANGER.length}`}
        </div>
        <div className="bamboo-actions">
          <button className="btn-ghost press" onClick={() => setBins({})}>重新分拣</button>
          <button className="btn-primary press bamboo-submit" disabled={!binsBalanced} onClick={submitClassify}>完 成 定 界</button>
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

      {drag?.moved && (
        <div className="song-drag-ghost" style={{
          position: "fixed", left: drag.x, top: drag.y,
          transform: "translate(-50%, -60%)", zIndex: 100, pointerEvents: "none",
        }}>
          <SongSlip text={drag.v} mini />
        </div>
      )}
    </div>
  );
}

export function MiniGamePage({ state, setState, gotoPage, onValueDeltas }: MiniGamePageProps) {
  const game = allGameNodes().find(g => g.id === state.activeGameId) || allGameNodes()[0];
  const [toast, setToast] = useState("");
  const [localClassifyRetry, setLocalClassifyRetry] = useState<boolean | null>(state.classifyRetry);
  const [feedback, setFeedback] = useState<GameResultRank | null>(null);
  const [grantedItems, setGrantedItems] = useState<ItemDef[]>([]);
  const [retryKey] = useState(0);

  // 华容道难度：classifyRetry=true(继续修正) → 简单, classifyRetry=false(退出) → 中等
  const woodenBoxHard = localClassifyRetry === false;

  const finish = (rank: GameResultRank) => {
    playSfx("unlock"); // 完成机关/游戏的成功音（优先级高于点击 tap，会在 30ms 内胜出）
    let ns = applyNarrativeResult(applyResult(state, game, rank), game, rank);
    // 木盒夹层：高完成度=藏卷成功(found)，其余=险些被搜出(missed)。
    // 搜查压力已由 applyResult 的 boxPressure(非高+1) 幂等处理，此处只标记藏匿结果。
    if (game.kind === "woodenBox") {
      ns = { ...ns, boxCompartment: rank === "high" ? "found" : "missed" };
    }
    setState(ns);
    saveState(ns);
    // 结算后弹出右上角数值卡片（与剧情选择同款；卡片在 App 层，返回剧情后仍存活）
    const deltas = diffValues(
      state as unknown as Record<string, unknown>,
      ns as unknown as Record<string, unknown>,
      Date.now(),
    );
    if (deltas.length) onValueDeltas?.(deltas);
    // wangji_fake_doc 留给后续剧情台词（归档文书交接那一句）现身，此处不弹出。
    const newItemIds = ns.items.filter(id => !state.items.includes(id) && id !== "wangji_fake_doc");
    setGrantedItems(newItemIds.map(id => ITEMS[id]).filter((d): d is ItemDef => !!d?.image));
    setFeedback(rank);
  };

  // 结算印章弹窗关闭后：若本局获得了带图物品，先展示获得物品弹窗，再返回剧情。
  const dismissFeedback = () => {
    setFeedback(null);
    if (!grantedItems.length) gotoPage("story");
  };
  const dismissItemModal = () => {
    setGrantedItems([]);
    gotoPage("story");
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
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={dismissFeedback} />
        )}
        {feedback === null && grantedItems.length > 0 && (
          <GameItemModal items={grantedItems} onDismiss={dismissItemModal} />
        )}
      </>
    );
  }

  // 配药救急：全屏沉浸场景（药庐衬底）
  if (game.kind === "herbMemory" && !locked) {
    return (
      <>
        <HerbMemory
          key={retryKey}
          finish={finish}
          game={game}
          best={state.gameResults[game.id]?.best}
          onBack={() => gotoPage("story")}
        />
        <Toast text={toast} onDone={() => setToast("")} />
        {feedback !== null && (
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={dismissFeedback} />
        )}
        {feedback === null && grantedItems.length > 0 && (
          <GameItemModal items={grantedItems} onDismiss={dismissItemModal} />
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
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={dismissFeedback} />
        )}
        {feedback === null && grantedItems.length > 0 && (
          <GameItemModal items={grantedItems} onDismiss={dismissItemModal} />
        )}
      </>
    );
  }

  // 曹府查案：全屏沉浸场景（病案文件三联卡衬底）
  if (game.kind === "caseTriage" && !locked) {
    return (
      <>
        <CaseTriage
          key={retryKey}
          finish={finish}
          game={game}
          best={state.gameResults[game.id]?.best}
          onBack={() => gotoPage("story")}
        />
        <Toast text={toast} onDone={() => setToast("")} />
        {feedback !== null && (
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={dismissFeedback} />
        )}
        {feedback === null && grantedItems.length > 0 && (
          <GameItemModal items={grantedItems} onDismiss={dismissItemModal} />
        )}
      </>
    );
  }

  // 歌诀纠错：全屏沉浸场景（玄音残纸贴图衬底，两步定界/排序）
  if (game.kind === "songFormula" && !locked) {
    return (
      <>
        <SongBoundary
          key={retryKey}
          finish={finish}
          game={game}
          best={state.gameResults[game.id]?.best}
          onBack={() => gotoPage("story")}
        />
        <Toast text={toast} onDone={() => setToast("")} />
        {feedback !== null && (
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={dismissFeedback} />
        )}
        {feedback === null && grantedItems.length > 0 && (
          <GameItemModal items={grantedItems} onDismiss={dismissItemModal} />
        )}
      </>
    );
  }

  return (
    <Shell
      game={game} state={state} gotoPage={gotoPage}
      toast={toast} setToast={setToast}
      overlay={<>
        {feedback !== null && (
          <GameFeedbackOverlay rank={feedback} game={game} onDismiss={dismissFeedback} />
        )}
        {feedback === null && grantedItems.length > 0 && (
          <GameItemModal items={grantedItems} onDismiss={dismissItemModal} />
        )}
      </>}
    >
      <p>尚未获得进入此机关所需之物。</p>
    </Shell>
  );
}

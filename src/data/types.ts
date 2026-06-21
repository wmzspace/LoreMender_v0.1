export interface Chapter {
  id: string;
  num: number;
  name: string;
  brief: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  desc?: string;
  accent?: string;
  tag?: string;
  short?: string;
  detail?: string;
  silhouette?: SilhouetteKind;
  portrait?: string;
}

export type SilhouetteKind = "scholar" | "rugged" | "songbird" | "elder";

export interface Clue {
  id: string;
  name: string;
  icon: ClueIconType;
  title: string;
  body: string;
  note: string;
}

export type ClueIconType = "scroll" | "ledger" | "lips" | "music" | "needle";

export type EndingId =
  | "chenbo_true"
  | "chenbo_fallback"
  | "xuanyin_true"
  | "xuanyin_fallback"
  | "wangji_archive"
  | "wangji_trap"
  | "burn_ending"
  | "ash"
  | "sealed"
  | "living";

export interface Ending {
  id: EndingId;
  name: string;
  rank: string;
  rankColor: string;
  epitaph: string;
  body: string;
  glyph: string;
}

export type GameResultRank = "high" | "mid" | "low";

export interface StoredGameResult {
  best: GameResultRank;
  attempts: number;
  completed: boolean;
}

export type MiniGameKind =
  | "bambooPuzzle"
  | "woodenBox"
  | "herbMemory"
  | "caseTriage"
  | "songFormula";

export interface GameReward {
  item: string;
  skill?: keyof Pick<
    GameState,
    | "medical_skill"
    | "asked_heart"
    | "huatuo_trust"
    | "chenbo_trust"
    | "wangji_trust"
    | "xuanyin_trust"
    | "record_tendency"
    | "system_tendency"
    | "spread_tendency"
    | "burn_tendency"
  >;
}

export interface GameNode {
  id: string;
  name: string;
  kind: MiniGameKind;
  unlockItem: string;
  requiredItem?: string;
  nextBeatUnlocked: string;
  nextBeatUnlockedImage?: string;
  context?: string;
  reward: GameReward;
}

export interface Choice {
  label: string;
  toast?: string;
  set?: Partial<Record<keyof GameState, string | number | boolean | null>>;
  ending?: EndingId;
  condition?: Record<string, unknown>;
}

/** 可交互探索场景中的一个可点击热点（人/物），点击后展开 beats 对白。 */
export interface ExploreHotspot {
  id: string;
  label: string;       // 热点标签（如「自己」「邻室老者」）
  x: number;           // 横向定位，0–100 百分比
  y: number;           // 纵向定位，0–100 百分比
  image?: string;      // 点击热点后可切换到对应局部/物品图
  beats: Beat[];       // 点击后逐句展开的对白（仅 speaker / narration 行）
  /** 该热点首次看完后应用的数值变化（与 Choice.set 同规则），会触发右上角数值卡片提示。 */
  set?: Choice["set"];
}

/** 可交互探索场景：玩家点击场景中的人与物，分别跳到对应对白；可选要求全部看完后继续。 */
export interface ExploreScene {
  hint?: string;       // 顶部引导语
  image?: string;      // 场景底图（覆盖当前章背景）
  hotspots: ExploreHotspot[];
}

export type Beat =
  // itemReveal：该句对白播出时，弹出「获得物品」插图弹窗（物品早已在 state.items 里，仅补一次展示时机）。
  | { speaker: string; line: string; narration?: false; image?: string; itemReveal?: string[] }
  | { narration: true; line: string; image?: string; itemReveal?: string[] }
  | { game: GameNode; image?: string }
  | { choices: Choice[] }
  | { explore: ExploreScene }
  | { gotoChapter: string }
  | { gotoTrust: true }
  | { gotoEnding: true }
  | { unlockEnding: string; generatePoster?: boolean }
  // ifCmp：比较方式。默认 "eq"（字符串精确相等，用于 boxCompartment/ch4 等字符串状态）；
  // "gte"/"lte" 用于数值阈值（如 medical_skill 累加值 ≥1 / ≤0），避免精确相等漏判。
  | { ifKey: string; ifVal: string; ifCmp?: "eq" | "gte" | "lte"; beats: Beat[] };

export type SceneKind =
  | "xuchang_prison"
  | "street_market"
  | "cao_mansion"
  | "music_house"
  | "old_shrine"
  | "three_places"
  | "huatuo_cell"
  | "ending_true"
  | "ending_fallback"
  | "ending_trap"
  | "ending_ash"
  | "clinic_night"
  | "raid_coming"
  | "find_trust"
  | "final_choice";

export interface StoryChapter {
  scene: SceneKind;
  title: string;
  fullTitle: string;
  images?: Record<number, string>;
  gameImages?: Record<number, string>;
  beats: Beat[];
}

export interface GameState {
  firstImpression: string | null;
  trust_huatuo: string | null;
  found_clue: string | null;
  suspect: string | null;
  cao_suspicion: string | null;
  caoCunning: string | null;
  finalChoice: string | null;

  searchedClues: string[];
  trustedPerson: string | null;
  currentChapter: number;
  unlockedEndings: EndingId[];
  lastEnding: EndingId | null;

  items: string[];
  gameResults: Record<string, StoredGameResult>;
  activeGameId: string | null;

  medical_skill: number;
  asked_heart: number;
  huatuo_trust: number;     // 与华佗的羁绊；≥3 时结局达成可获华佗手书残句信物
  chenbo_trust: number;
  wangji_trust: number;
  xuanyin_trust: number;
  searchPressure: number;
  record_tendency: number;
  system_tendency: number;
  spread_tendency: number;
  burn_tendency: number;

  classifyRetry: boolean | null; // true=分类后继续修正, false=直接退出, null=未决定

  // 木盒夹层：困难难度高完成度="found"(藏卷成功)，其余完成="missed"(险些被搜出)
  boxCompartment?: "found" | "missed" | null;

  firstChoice?: string | null;
  ch2?: string | null;
  ch3?: string | null;
  ch4?: string | null;
  finalDecision?: string | null;
}

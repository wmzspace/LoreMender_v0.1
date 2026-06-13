// ── 通用基础类型 ────────────────────────────────────────────────

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

// ── 结局类型 ────────────────────────────────────────────────────

/** 华佗副本结局 ID */
export type EndingId =
  | "chenbo_true"
  | "xuanyin_fallback"
  | "wangji_trap"
  | "burn_ending"
  // 旧版兼容
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

// ── 选项 / Beat 类型 ────────────────────────────────────────────

export interface Choice {
  label: string;
  toast?: string;
  /** 状态变更，值统一为字符串（序列化友好） */
  set?: Record<string, string>;
  ending?: EndingId;
  /** 显示条件（仅运行时使用，编辑器可忽略） */
  condition?: Record<string, unknown>;
}

export type Beat =
  | { speaker: string; line: string; narration?: false }
  | { narration: true; line: string }
  | { choices: Choice[] }
  | { gotoChapter: string }
  | { gotoTrust: true }
  | { gotoEnding: true }
  | { unlockEnding: string; generatePoster?: boolean };

// ── 场景 / 章节 ─────────────────────────────────────────────────

export type SceneKind =
  // 华佗副本场景
  | "xuchang_prison"
  | "three_places"
  | "cao_mansion"
  | "huatuo_cell"
  | "ending_true"
  | "ending_fallback"
  | "ending_trap"
  | "ending_ash"
  // 旧版兼容
  | "clinic_night"
  | "raid_coming"
  | "find_trust"
  | "final_choice";

export interface StoryChapter {
  scene: SceneKind;
  title: string;
  beats: Beat[];
}

// ── 游戏状态 ────────────────────────────────────────────────────

export interface GameState {
  // 华佗副本新字段
  firstImpression: string | null;
  trust_huatuo: string | null;
  found_clue: string | null;
  suspect: string | null;
  cao_suspicion: string | null;
  caoCunning: string | null;
  finalChoice: string | null;

  // 通用字段
  searchedClues: string[];
  trustedPerson: string | null;
  currentChapter: number;
  unlockedEndings: EndingId[];
  lastEnding: EndingId | null;

  // 旧版兼容字段（保留避免 localStorage 读取报错）
  firstChoice?: string | null;
  ch2?: string | null;
  finalDecision?: string | null;
}

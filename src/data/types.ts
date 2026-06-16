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
  | "xuanyin_fallback"
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
    "medical_skill" | "asked_heart" | "chenbo_trust" | "wangji_trust" | "xuanyin_trust"
  >;
}

export interface GameNode {
  id: string;
  name: string;
  kind: MiniGameKind;
  unlockItem: string;
  requiredItem?: string;
  nextBeatUnlocked: string;
  reward: GameReward;
}

export interface Choice {
  label: string;
  toast?: string;
  set?: Record<string, string>;
  ending?: EndingId;
  condition?: Record<string, unknown>;
}

export type Beat =
  | { speaker: string; line: string; narration?: false }
  | { narration: true; line: string }
  | { game: GameNode }
  | { choices: Choice[] }
  | { gotoChapter: string }
  | { gotoTrust: true }
  | { gotoEnding: true }
  | { unlockEnding: string; generatePoster?: boolean };

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
  chenbo_trust: number;
  wangji_trust: number;
  xuanyin_trust: number;

  classifyRetry: boolean | null; // true=分类后继续修正, false=直接退出, null=未决定

  firstChoice?: string | null;
  ch2?: string | null;
  finalDecision?: string | null;
}

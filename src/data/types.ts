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

export interface Ending {
  id: EndingId;
  name: string;
  rank: string;
  rankColor: string;
  epitaph: string;
  body: string;
  glyph: string;
}

export type EndingId = "ash" | "sealed" | "living";

export interface Choice {
  label: string;
  toast?: string;
  set?: Partial<GameState>;
  ending?: EndingId;
}

export type Beat =
  | { speaker: string; line: string; narration?: false }
  | { narration: true; line: string }
  | { choices: Choice[] }
  | { gotoChapter: string }
  | { gotoTrust: true }
  | { gotoEnding: true };

export interface StoryChapter {
  scene: SceneKind;
  title: string;
  beats: Beat[];
}

export type SceneKind =
  | "clinic_night"
  | "raid_coming"
  | "find_trust"
  | "final_choice";

export interface GameState {
  firstChoice: string | null;
  ch2: string | null;
  searchedClues: string[];
  trustedPerson: string | null;
  finalDecision: string | null;
  currentChapter: number;
  unlockedEndings: EndingId[];
  lastEnding: EndingId | null;
}

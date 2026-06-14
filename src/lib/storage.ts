import type { GameState } from "../data/types";

export const STORAGE_KEY = "loremender:huatuo:v2";

export function defaultState(): GameState {
  return {
    // 华佗副本字段
    firstImpression: null,
    trust_huatuo: null,
    found_clue: null,
    suspect: null,
    cao_suspicion: null,
    caoCunning: null,
    finalChoice: null,
    // 通用字段
    searchedClues: [],
    trustedPerson: null,
    currentChapter: 1,
    unlockedEndings: [],
    lastEnding: null,
    // 旧版兼容
    firstChoice: null,
    ch2: null,
    finalDecision: null,
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(s: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// Per-chapter reading position, persisted separately from GameState so that
// leaving the story tab (线索/进程/图鉴) and coming back resumes the same beat
// instead of replaying the chapter from the top. Tagged with the chapter, so a
// new chapter (or new game on ch1) naturally starts at 0.
const BEAT_KEY = "loremender:huatuo:beat";

export function saveBeat(chapter: number, idx: number): void {
  try {
    localStorage.setItem(BEAT_KEY, JSON.stringify({ c: chapter, i: idx }));
  } catch {
    /* ignore */
  }
}

export function loadBeat(chapter: number): number {
  try {
    const raw = localStorage.getItem(BEAT_KEY);
    if (!raw) return 0;
    const { c, i } = JSON.parse(raw);
    return c === chapter && typeof i === "number" ? i : 0;
  } catch {
    return 0;
  }
}

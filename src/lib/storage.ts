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

import type { GameState } from "../data/types";

export const STORAGE_KEY = "loremender:huatuo:v1";

export function defaultState(): GameState {
  return {
    firstChoice: null,
    ch2: null,
    searchedClues: [],
    trustedPerson: null,
    finalDecision: null,
    currentChapter: 1,
    unlockedEndings: [],
    lastEnding: null,
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

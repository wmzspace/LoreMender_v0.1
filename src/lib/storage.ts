import type { GameState } from "../data/types";

export const STORAGE_KEY = "loremender:huatuo:v4";

export function defaultState(): GameState {
  return {
    firstImpression: null,
    trust_huatuo: null,
    found_clue: null,
    suspect: null,
    cao_suspicion: null,
    caoCunning: null,
    finalChoice: null,
    searchedClues: [],
    trustedPerson: null,
    currentChapter: 1,
    unlockedEndings: [],
    lastEnding: null,
    items: [],
    gameResults: {},
    activeGameId: null,
    medical_skill: 0,
    asked_heart: 0,
    chenbo_trust: 0,
    wangji_trust: 0,
    xuanyin_trust: 0,
    classifyRetry: null,
    boxCompartment: null,
    firstChoice: null,
    ch2: null,
    ch3: null,
    ch4: null,
    finalDecision: null,
  };
}

export function normalizeState(value: Partial<GameState> | null | undefined): GameState {
  const base = defaultState();
  const merged = { ...base, ...(value || {}) } as GameState;
  merged.searchedClues = Array.isArray(merged.searchedClues) ? merged.searchedClues : [];
  merged.unlockedEndings = Array.isArray(merged.unlockedEndings) ? merged.unlockedEndings : [];
  merged.items = Array.isArray(merged.items) ? merged.items : [];
  merged.gameResults = merged.gameResults && typeof merged.gameResults === "object" ? merged.gameResults : {};
  merged.medical_skill = Number(merged.medical_skill || 0);
  merged.asked_heart = Number(merged.asked_heart || 0);
  merged.chenbo_trust = Number(merged.chenbo_trust || 0);
  merged.wangji_trust = Number(merged.wangji_trust || 0);
  merged.xuanyin_trust = Number(merged.xuanyin_trust || 0);
  merged.classifyRetry = merged.classifyRetry ?? null;
  merged.boxCompartment = merged.boxCompartment ?? null;
  return merged;
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveState(s: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(s)));
  } catch {
    /* ignore */
  }
}

const BEAT_KEY = "loremender:huatuo:beat:v4";

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

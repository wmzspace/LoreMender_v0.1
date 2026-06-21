import type { GameState } from "../data/types";

export const STORAGE_KEY = "loremender:huatuo:v4";

// —— 序幕是否已看过：首次开始游戏自动播放一次，之后开始游戏直接进开场动画；「查看设定」可重看 ——
const PROLOGUE_SEEN_KEY = "loremender:prologueSeen";
export function isPrologueSeen(): boolean {
  try { return localStorage.getItem(PROLOGUE_SEEN_KEY) === "1"; } catch { return false; }
}
export function markPrologueSeen(): void {
  try { localStorage.setItem(PROLOGUE_SEEN_KEY, "1"); } catch { /* 无痕模式忽略 */ }
}

/**
 * 进度重置：删除本应用的本地存储（存档、章节进度、序幕标记等）。
 * 保留音量设置（loremender:huatuo:audio）与开发者模式开关，重置不影响这类设备级偏好。
 */
const AUDIO_SETTINGS_KEY = "loremender:huatuo:audio";
const DEV_MODE_KEY = "loremender:devMode";
export function clearAllStorage(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("loremender:") && k !== AUDIO_SETTINGS_KEY && k !== DEV_MODE_KEY) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch { /* 无痕模式忽略 */ }
}

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
    huatuo_trust: 0,
    chenbo_trust: 0,
    wangji_trust: 0,
    xuanyin_trust: 0,
    searchPressure: 0,
    record_tendency: 0,
    system_tendency: 0,
    spread_tendency: 0,
    burn_tendency: 0,
    classifyRetry: null,
    boxCompartment: null,
    firstChoice: null,
    ch2: null,
    ch3: null,
    ch4: null,
    finalDecision: null,
    exploreLog: {},
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
  merged.huatuo_trust = Number(merged.huatuo_trust || 0);
  merged.chenbo_trust = Number(merged.chenbo_trust || 0);
  merged.wangji_trust = Number(merged.wangji_trust || 0);
  merged.xuanyin_trust = Number(merged.xuanyin_trust || 0);
  merged.searchPressure = Number(merged.searchPressure || 0);
  merged.record_tendency = Number(merged.record_tendency || 0);
  merged.system_tendency = Number(merged.system_tendency || 0);
  merged.spread_tendency = Number(merged.spread_tendency || 0);
  merged.burn_tendency = Number(merged.burn_tendency || 0);
  merged.classifyRetry = merged.classifyRetry ?? null;
  merged.boxCompartment = merged.boxCompartment ?? null;
  merged.exploreLog = merged.exploreLog && typeof merged.exploreLog === "object" ? merged.exploreLog : {};
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

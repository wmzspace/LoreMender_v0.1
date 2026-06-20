import { useEffect, useState } from "react";

const DIALOGUE_AUDIO_BASE = "/audio/levels/1/dialogue";
const SETTINGS_KEY = "loremender:huatuo:audio";

// iOS Safari requires HTMLAudioElement to be constructed inside a user-gesture handler.
// We create one during primeAudio() (fired on the very first tap) and reuse it for the
// first playDialogueAudio() call — this sidesteps the "play() not allowed" block.
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

/** Path to the pre-generated narration/dialogue audio for a given chapter + beat index. */
export function dialogueAudioPath(chapter: number, beatIdx: number): string {
  return `${DIALOGUE_AUDIO_BASE}/ch${chapter}/${beatIdx}.mp3`;
}

/** 探索热点对白的配音路径（见 tools/tts-generate/generate-explore-audio.ts）。 */
export function exploreAudioPath(chapter: number, hotspotId: string, subIdx: number): string {
  return `${DIALOGUE_AUDIO_BASE}/ch${chapter}/explore/${hotspotId}_${subIdx}.mp3`;
}

// ── 三通道音量/静音设置 ─────────────────────────────────────────
// bgm=背景声音, dialogue=对话声音, sfx=系统声音。每个通道有 0..1 的音量与独立静音。
export type AudioChannel = "bgm" | "dialogue" | "sfx";
export interface ChannelSetting { volume: number; muted: boolean; }
export type AudioSettings = Record<AudioChannel, ChannelSetting>;

export const AUDIO_CHANNELS: AudioChannel[] = ["bgm", "dialogue", "sfx"];

const DEFAULT_SETTINGS: AudioSettings = {
  bgm: { volume: 0.35, muted: false },
  dialogue: { volume: 1, muted: false },
  sfx: { volume: 1, muted: false },
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 浅克隆设置（不依赖 structuredClone，兼容旧版 WebKit）。 */
function cloneSettings(s: AudioSettings): AudioSettings {
  const out = {} as AudioSettings;
  for (const ch of AUDIO_CHANNELS) out[ch] = { ...s[ch] };
  return out;
}

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AudioSettings>;
      const merged = {} as AudioSettings;
      for (const ch of AUDIO_CHANNELS) {
        const d = DEFAULT_SETTINGS[ch];
        const p = parsed[ch];
        merged[ch] = {
          volume: typeof p?.volume === "number" ? clamp01(p.volume) : d.volume,
          muted: typeof p?.muted === "boolean" ? p.muted : d.muted,
        };
      }
      return merged;
    }
  } catch { /* ignore */ }
  return cloneSettings(DEFAULT_SETTINGS);
}

let _settings: AudioSettings = loadSettings();

function persistSettings(): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings)); } catch { /* ignore */ }
}

/** 通道有效增益（静音时为 0），用于实际播放音量。 */
export function channelGain(ch: AudioChannel): number {
  const s = _settings[ch];
  return s.muted ? 0 : s.volume;
}

const settingsListeners = new Set<(s: AudioSettings) => void>();

// iOS Safari 忽略 HTMLMediaElement.volume，必须用 WebAudio GainNode 控制 BGM/对话音量。
// 这两个 helper 优先走 GainNode（已路由时），否则回退到 element.volume（桌面/未路由）。
function applyBgmVolume(): void {
  const g = channelGain("bgm");
  if (_bgmGain) { _bgmGain.gain.value = g; if (_bgmEl) _bgmEl.volume = 1; }
  else if (_bgmEl) _bgmEl.volume = g;
}
function applyDialogueVolume(): void {
  const g = channelGain("dialogue");
  if (_dialogueGain) { _dialogueGain.gain.value = g; if (_dialogueEl) _dialogueEl.volume = 1; }
  else if (_dialogueEl) _dialogueEl.volume = g;
}

function applySettings(): void {
  applyBgmVolume();
  // 取消静音/调大音量时若 BGM 已加载且被暂停，则续播（设置面板的点击本身即手势，iOS 允许）。
  if (_bgmEl && currentBgmSrc && channelGain("bgm") > 0 && _bgmEl.paused) {
    _bgmEl.play().catch(() => {});
  }
  applyDialogueVolume();
  if (_sfxGain) _sfxGain.gain.value = channelGain("sfx");
}

function emitSettings(): void {
  const snapshot = cloneSettings(_settings);
  settingsListeners.forEach(fn => fn(snapshot));
}

export function getAudioSettings(): AudioSettings {
  return cloneSettings(_settings);
}

export function setChannelVolume(ch: AudioChannel, volume: number): void {
  _settings[ch] = { ..._settings[ch], volume: clamp01(volume) };
  persistSettings();
  applySettings();
  emitSettings();
}

export function setChannelMuted(ch: AudioChannel, muted: boolean): void {
  _settings[ch] = { ..._settings[ch], muted };
  persistSettings();
  applySettings();
  emitSettings();
}

/** Hook：订阅当前三通道音量/静音设置。 */
export function useAudioSettings(): AudioSettings {
  const [s, setS] = useState(getAudioSettings);
  useEffect(() => {
    settingsListeners.add(setS);
    return () => { settingsListeners.delete(setS); };
  }, []);
  return s;
}

/** 兼容旧接口：对话通道是否静音（EndingPage 据此决定是否自动播放结局旁白）。 */
export function useAudioMuted(): boolean {
  const s = useAudioSettings();
  return s.dialogue.muted || s.dialogue.volume <= 0;
}

// iOS 只允许在用户手势中「激活」过的 HTMLAudioElement 之后再播放。因此对话与 BGM 各保留
// 一个常驻元素，在 primeAudio()（首次点击）里用静音 WAV 解锁，之后只切换 src 复用同一元素。
let _dialogueEl: HTMLAudioElement | null = null;
let _bgmEl: HTMLAudioElement | null = null;
// WebAudio 路由节点（在 primeAudio 内建立）：用 GainNode 控制音量以兼容 iOS。
let _bgmGain: GainNode | null = null;
let _dialogueGain: GainNode | null = null;
let _bgmSource: MediaElementAudioSourceNode | null = null;
let _dialogueSource: MediaElementAudioSourceNode | null = null;
let currentSrc: string | null = null;

function getDialogueEl(): HTMLAudioElement {
  if (!_dialogueEl) _dialogueEl = new Audio();
  return _dialogueEl;
}

/** Plays the dialogue audio at `src`, replacing any currently-playing line. No-op while muted. */
export function playDialogueAudio(src: string, onEnded?: () => void, rate = 1.0): void {
  if (channelGain("dialogue") <= 0) return;
  const audio = getDialogueEl();
  if (currentSrc === src && !audio.paused) return;
  audio.pause();
  audio.src = src;
  audio.currentTime = 0;
  audio.playbackRate = rate;
  audio.onended = onEnded ?? null; // 复用元素，用属性赋值避免监听器堆积
  applyDialogueVolume(); // 经 GainNode 设音量（iOS 不支持 element.volume）
  audio.play().catch(() => {});
  currentSrc = src;
}

export function stopDialogueAudio(): void {
  if (_dialogueEl) {
    _dialogueEl.pause();
    _dialogueEl.currentTime = 0;
    _dialogueEl.onended = null;
  }
  currentSrc = null;
}

export function resumeDialogueIfPaused(): void {
  if (_dialogueEl && currentSrc && _dialogueEl.paused && channelGain("dialogue") > 0) {
    _dialogueEl.play().catch(() => {});
  }
}

const SFX_BASE = "/audio/levels/1/sfx";

export type SfxName = "tap" | "back" | "confirm" | "nav" | "unlock";
const SFX_NAMES: SfxName[] = ["tap", "back", "confirm", "nav", "unlock"];

/** "tap" is the generic fallback sound and yields to any more specific SFX requested in the same tick. */
const SFX_PRIORITY: Record<SfxName, number> = {
  tap: 0, back: 1, confirm: 1, nav: 1, unlock: 1,
};

// --- Web Audio API singleton for zero-latency SFX ---
let _actx: AudioContext | null = null;
let _sfxGain: GainNode | null = null;
const _sfxBuffers = new Map<SfxName, AudioBuffer>();

function getAudioContext(): AudioContext {
  if (!_actx) {
    _actx = new AudioContext();
    _sfxGain = _actx.createGain();
    _sfxGain.gain.value = channelGain("sfx");
    _sfxGain.connect(_actx.destination);
  }
  return _actx;
}

let _primed = false;

/**
 * Call on the first user gesture (e.g. any screen tap) to unlock the AudioContext
 * and pre-decode all SFX into memory — subsequent plays are near-instant.
 */
export function primeAudio(): void {
  if (_primed) return;
  _primed = true;
  const ctx = getAudioContext();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  // 在本次用户手势中「激活」对话与 BGM 的常驻元素：播一段静音 WAV 解锁，
  // 之后切换 src 再播放就不再受 iOS 自动播放限制。
  if (!_dialogueEl) _dialogueEl = new Audio();
  if (!_bgmEl) { _bgmEl = new Audio(); _bgmEl.loop = true; }
  // 对话元素用静音 WAV 解锁。
  _dialogueEl.src = SILENT_WAV;
  _dialogueEl.play().then(() => { _dialogueEl!.pause(); _dialogueEl!.currentTime = 0; }).catch(() => {});
  // BGM：若解锁前已请求过某曲（自动播放被拦截），就在本次手势内直接播该曲补上；否则静音解锁。
  if (currentBgmSrc) {
    _bgmEl.src = currentBgmSrc;
    _bgmEl.loop = true;
    _bgmEl.play().catch(() => {});
  } else {
    _bgmEl.src = SILENT_WAV;
    _bgmEl.play().then(() => { _bgmEl!.pause(); _bgmEl!.currentTime = 0; }).catch(() => {});
  }
  // 将 BGM/对话接入 WebAudio 图，用 GainNode 控制音量（iOS 忽略 element.volume）。
  // createMediaElementSource 每个元素只能调用一次，故用 _xxxSource 守卫。
  try {
    if (_bgmEl && !_bgmSource) {
      _bgmSource = ctx.createMediaElementSource(_bgmEl);
      _bgmGain = ctx.createGain();
      _bgmSource.connect(_bgmGain).connect(ctx.destination);
    }
    if (_dialogueEl && !_dialogueSource) {
      _dialogueSource = ctx.createMediaElementSource(_dialogueEl);
      _dialogueGain = ctx.createGain();
      _dialogueSource.connect(_dialogueGain).connect(ctx.destination);
    }
    applySettings();
  } catch { /* 路由失败则回退 element.volume（桌面可用） */ }
  SFX_NAMES.forEach(async (name) => {
    try {
      const res = await fetch(`${SFX_BASE}/${name}.wav`);
      const arr = await res.arrayBuffer();
      _sfxBuffers.set(name, await ctx.decodeAudioData(arr));
    } catch { /* non-fatal */ }
  });
}

let pendingSfx: SfxName | null = null;
let pendingPriority = -1;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Plays a short UI sound effect. No-op while muted.
 * Uses pre-decoded Web Audio buffers for near-zero latency; falls back to
 * HTMLAudioElement if the buffer isn't loaded yet (e.g. very first interaction).
 * Multiple SFX requested in the same 30 ms window resolve to the highest-priority one.
 */
export function playSfx(name: SfxName): void {
  if (channelGain("sfx") <= 0) return;
  const priority = SFX_PRIORITY[name];
  if (priority > pendingPriority) {
    pendingSfx = name;
    pendingPriority = priority;
  }
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    const sfx = pendingSfx;
    pendingSfx = null;
    pendingPriority = -1;
    flushTimer = null;
    if (!sfx) return;
    const buf = _sfxBuffers.get(sfx);
    if (buf && _actx?.state === "running" && _sfxGain) {
      // Pre-decoded path — effectively zero latency (only when context is confirmed running)
      const src = _actx.createBufferSource();
      src.buffer = buf;
      src.connect(_sfxGain);
      src.start(0);
    } else {
      // Fallback: HTMLAudioElement — works within iOS gesture propagation window
      const a = new Audio(`${SFX_BASE}/${sfx}.wav`);
      a.volume = channelGain("sfx");
      a.play().catch(() => {});
    }
  }, 30);
}

const BGM_BASE = "/audio/levels/1/bgm";

/** Loopable chapter BGM, named after each chapter's theme (see src/data/competition.ts). */
const CHAPTER_BGM: Record<number, string> = {
  1: "prison_loop", 2: "investigation_loop", 3: "power_loop", 4: "choice_loop", 5: "echo_loop",
};

/** Path to the looping BGM for a given chapter, or null if none is defined. */
export function bgmPath(chapter: number): string | null {
  const name = CHAPTER_BGM[chapter];
  return name ? `${BGM_BASE}/${name}.mp3` : null;
}

let currentBgmSrc: string | null = null;

function getBgmEl(): HTMLAudioElement {
  if (!_bgmEl) { _bgmEl = new Audio(); _bgmEl.loop = true; }
  return _bgmEl;
}

/** Plays (and loops) the BGM at `src`, replacing any currently-playing track. */
export function playBgm(src: string): void {
  if (currentBgmSrc === src) return;
  // 复用常驻 BGM 元素（已在 primeAudio 中解锁），仅切换 src，规避 iOS 自动播放限制。
  const audio = getBgmEl();
  audio.pause();
  audio.src = src;
  audio.loop = true;
  audio.currentTime = 0;
  currentBgmSrc = src;
  applyBgmVolume(); // 经 GainNode 设音量（iOS 不支持 element.volume）
  // 静音时仍播放（GainNode=0 静音），以便在设置面板里取消静音即时出声。
  audio.play().catch(() => {});
}

export function stopBgm(): void {
  if (_bgmEl) {
    _bgmEl.pause();
    _bgmEl.currentTime = 0;
  }
  currentBgmSrc = null;
}

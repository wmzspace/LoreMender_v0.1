import { useEffect, useState } from "react";

const DIALOGUE_AUDIO_BASE = "/audio/levels/1/dialogue";
const MUTE_KEY = "loremender:huatuo:muted";

/** Path to the pre-generated narration/dialogue audio for a given chapter + beat index. */
export function dialogueAudioPath(chapter: number, beatIdx: number): string {
  return `${DIALOGUE_AUDIO_BASE}/ch${chapter}/${beatIdx}.mp3`;
}

export function isAudioMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

const muteListeners = new Set<(muted: boolean) => void>();

export function setAudioMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (muted) {
    stopDialogueAudio();
    currentBgm?.pause();
  } else {
    currentBgm?.play().catch(() => {});
  }
  if (_sfxGain) _sfxGain.gain.value = muted ? 0 : 1;
  muteListeners.forEach(fn => fn(muted));
}

/** Hook for UI controls that need to reflect/toggle the mute state. */
export function useAudioMuted(): boolean {
  const [muted, setMuted] = useState(isAudioMuted);
  useEffect(() => {
    muteListeners.add(setMuted);
    return () => { muteListeners.delete(setMuted); };
  }, []);
  return muted;
}

let currentAudio: HTMLAudioElement | null = null;
let currentSrc: string | null = null;

/** Plays the dialogue audio at `src`, replacing any currently-playing line. No-op while muted. */
export function playDialogueAudio(src: string): void {
  if (isAudioMuted()) return;
  if (currentSrc === src && currentAudio && !currentAudio.paused) return;
  stopDialogueAudio();
  const audio = new Audio(src);
  // Autoplay may be blocked by the browser until the user interacts with the page; ignore.
  audio.play().catch(() => {});
  currentAudio = audio;
  currentSrc = src;
}

export function stopDialogueAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = null;
  currentSrc = null;
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
    _sfxGain.gain.value = isAudioMuted() ? 0 : 1;
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
  if (isAudioMuted()) return;
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
      new Audio(`${SFX_BASE}/${sfx}.wav`).play().catch(() => {});
    }
  }, 30);
}

const BGM_BASE = "/audio/levels/1/bgm";
const BGM_VOLUME = 0.35;

/** Loopable chapter BGM, named after each chapter's theme (see src/data/competition.ts). */
const CHAPTER_BGM: Record<number, string> = {
  1: "prison_loop", 2: "investigation_loop", 3: "power_loop", 4: "choice_loop", 5: "echo_loop",
};

/** Path to the looping BGM for a given chapter, or null if none is defined. */
export function bgmPath(chapter: number): string | null {
  const name = CHAPTER_BGM[chapter];
  return name ? `${BGM_BASE}/${name}.mp3` : null;
}

let currentBgm: HTMLAudioElement | null = null;
let currentBgmSrc: string | null = null;

/** Plays (and loops) the BGM at `src`, replacing any currently-playing track. No-op while muted. */
export function playBgm(src: string): void {
  if (currentBgmSrc === src) return;
  stopBgm();
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = BGM_VOLUME;
  currentBgm = audio;
  currentBgmSrc = src;
  if (!isAudioMuted()) audio.play().catch(() => {});
}

export function stopBgm(): void {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }
  currentBgm = null;
  currentBgmSrc = null;
}

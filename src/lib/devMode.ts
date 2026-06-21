import { useEffect, useState } from "react";

/**
 * 开发者模式：打开后，小游戏显示「开发者跳过」（可任选高/中/低评级），探索场景显示可直接选结果的开发者跳过；
 * 关闭（默认）时只显示玩家级别的「跳过」（强制低评级 / 跳过场景探索，且会弹一次性警示弹窗）。
 * 与音量设置一样存在 localStorage，是设备/浏览器级偏好，不随「重置进度」清空。
 */
const DEV_MODE_KEY = "loremender:devMode";

function loadDevMode(): boolean {
  try { return localStorage.getItem(DEV_MODE_KEY) === "1"; } catch { return false; }
}

let _devMode = loadDevMode();
const listeners = new Set<(v: boolean) => void>();

export function isDevMode(): boolean {
  return _devMode;
}

export function setDevMode(v: boolean): void {
  _devMode = v;
  try { localStorage.setItem(DEV_MODE_KEY, v ? "1" : "0"); } catch { /* 无痕模式忽略 */ }
  listeners.forEach(fn => fn(_devMode));
}

export function useDevMode(): boolean {
  const [v, setV] = useState(_devMode);
  useEffect(() => {
    listeners.add(setV);
    return () => { listeners.delete(setV); };
  }, []);
  return v;
}

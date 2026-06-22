import { useEffect, useState } from "react";

/**
 * 画质档位：右上角「画质」可切换，控制那些持续吃 GPU 的特效强度。
 * - ultra(极致)：全特效——磨砂模糊 10px / 颗粒(mix-blend) / 满屏粒子，最耗性能。
 * - high(高，默认)：保留磨砂与颗粒，但对白框模糊减半、粒子减半且避开对白框背后
 *   (让常驻对白框的 backdrop-filter 背景变成静止画面、blur 不再逐帧重算——这是最大单点收益)。
 * - medium(中)：关闭粒子与颗粒、对白框/弹窗去掉 backdrop-filter 模糊改用实底，最流畅省电。
 *
 * 与音量/开发者模式一样存在 localStorage，是设备/浏览器级偏好，不随「重置进度」清空。
 * 档位以 data-quality 写在 <html> 上，纯视觉部分由 CSS 按属性选择器接管；
 * 粒子数量/分布等需要 JS 的部分由 useQuality() 驱动。
 */
export type Quality = "medium" | "high" | "ultra";

export const QUALITY_KEY = "loremender:quality";
/** 从高到低，供设置面板排列。 */
export const QUALITY_ORDER: Quality[] = ["ultra", "high", "medium"];
export const QUALITY_LABEL: Record<Quality, string> = {
  ultra: "极 致",
  high: "高",
  medium: "中",
};
export const QUALITY_HINT: Record<Quality, string> = {
  ultra: "全特效全开，最耗性能",
  high: "保留质感、明显更省",
  medium: "省电优先，最流畅",
};

function loadQuality(): Quality {
  try {
    const v = localStorage.getItem(QUALITY_KEY);
    if (v === "medium" || v === "high" || v === "ultra") return v;
  } catch { /* 无痕模式忽略 */ }
  return "ultra"; // 默认满质感档（玩家可在右上角「画质」自行降到 高/中 提升流畅度）
}

function applyToRoot(q: Quality): void {
  try { document.documentElement.dataset.quality = q; } catch { /* 无 DOM 环境忽略 */ }
}

let _quality = loadQuality();
applyToRoot(_quality); // 模块加载即写到 <html data-quality>，让 CSS 在首帧就生效
const listeners = new Set<(v: Quality) => void>();

export function getQuality(): Quality {
  return _quality;
}

export function setQuality(v: Quality): void {
  if (v === _quality) return;
  _quality = v;
  try { localStorage.setItem(QUALITY_KEY, v); } catch { /* 无痕模式忽略 */ }
  applyToRoot(v);
  listeners.forEach(fn => fn(_quality));
}

export function useQuality(): Quality {
  const [v, setV] = useState(_quality);
  useEffect(() => {
    listeners.add(setV);
    setV(_quality); // 订阅时同步一次，防止订阅前已发生过切换
    return () => { listeners.delete(setV); };
  }, []);
  return v;
}

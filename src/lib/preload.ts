/** 通用预加载原语:只管「怎么预取」,不知道「该预取什么」(那部分见 assetPreload.ts)。 */

const preloadedImages = new Set<string>();
const preloadedVideos = new Set<string>();

export function preloadImage(path?: string | null) {
  if (!path || preloadedImages.has(path)) return;
  preloadedImages.add(path);
  const img = new Image();
  img.src = path;
}

export function preloadImages(paths: (string | null | undefined)[]) {
  for (const p of paths) preloadImage(p);
}

/** 用不挂载到页面的隐藏 <video preload="auto"> 预热浏览器缓存——不出声不出画,
 *  真正的 <video> 元素挂载时只要 src 相同就会命中缓存,几乎瞬时起播。
 *  视频体积较大,调用方需自行评估时机,别在用户大概率看不到时也抢带宽。 */
export function preloadVideo(path?: string | null) {
  if (!path || preloadedVideos.has(path)) return;
  preloadedVideos.add(path);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.src = path;
  video.load();
}

export function preloadVideos(paths: (string | null | undefined)[]) {
  for (const p of paths) preloadVideo(p);
}

/** 把一批预加载工作丢到浏览器空闲时段执行,避免跟当前页面的首屏渲染/交互抢带宽。
 *  没有 requestIdleCallback 的环境(如 Safari)退化为短延时。 */
export function idlePreload(fn: () => void) {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (ric) ric(fn);
  else window.setTimeout(fn, 200);
}

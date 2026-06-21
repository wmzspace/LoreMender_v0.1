/** 通用预加载原语:只管「怎么预取」,不知道「该预取什么」(那部分见 assetPreload.ts)。
 *  同一个 url 的 fire-and-forget 预取(preloadImage)和需要等待完成的加载(loadImage)
 *  共用同一份 in-flight Promise 缓存——已经在后台预取过的资源,后面需要"等它加载完"时直接复用,不会重复发请求。 */

const imagePromises = new Map<string, Promise<void>>();
const videoPromises = new Map<string, Promise<void>>();

/** 单个资源的最长等待时间:防止某张图/某段视频因为奇怪的网络环境/编码问题卡住,导致加载页面死等。 */
const LOAD_TIMEOUT_MS = 12000;

function withTimeout(p: Promise<void>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const t = window.setTimeout(resolve, ms);
    p.then(() => { window.clearTimeout(t); resolve(); });
  });
}

function loadImageInternal(path: string): Promise<void> {
  let p = imagePromises.get(path);
  if (p) return p;
  p = withTimeout(new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // 单张坏图/404 不阻塞整体,容错优先
    img.src = path;
  }), LOAD_TIMEOUT_MS);
  imagePromises.set(path, p);
  return p;
}

function loadVideoInternal(path: string): Promise<void> {
  let p = videoPromises.get(path);
  if (p) return p;
  p = withTimeout(new Promise<void>((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.oncanplaythrough = () => resolve();
    video.onerror = () => resolve();
    video.src = path;
    video.load();
  }), LOAD_TIMEOUT_MS);
  videoPromises.set(path, p);
  return p;
}

/** 后台静默预取,不关心、不等待结果——用于"提前丢请求,不阻塞当前页面"的场景。 */
export function preloadImage(path?: string | null) {
  if (path) loadImageInternal(path);
}
export function preloadImages(paths: (string | null | undefined)[]) {
  for (const p of paths) preloadImage(p);
}
export function preloadVideo(path?: string | null) {
  if (path) loadVideoInternal(path);
}
export function preloadVideos(paths: (string | null | undefined)[]) {
  for (const p of paths) preloadVideo(p);
}

/** 等待资源真正加载完成(或超时/出错兜底)。用于"进入页面前必须确保素材已就位"的硬阻塞场景。 */
export function loadImage(path?: string | null): Promise<void> {
  return path ? loadImageInternal(path) : Promise.resolve();
}
export function loadVideo(path?: string | null): Promise<void> {
  return path ? loadVideoInternal(path) : Promise.resolve();
}

/** 并行等待一批图片/视频加载完成。 */
export async function loadAll(paths: (string | null | undefined)[], kind: "image" | "video" = "image"): Promise<void> {
  const load = kind === "video" ? loadVideoInternal : loadImageInternal;
  await Promise.all(paths.filter((p): p is string => !!p).map(load));
}

/** 按顺序依次等待加载完成(而非全部并发)——保证排在前面的素材先就位,
 *  也避免一次性甩出大量并发请求抢占带宽。onProgress 在每张/每段加载完成后回调,供进度提示使用。 */
export async function loadSequential(
  paths: (string | null | undefined)[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  const list = paths.filter((p): p is string => !!p);
  let loaded = 0;
  onProgress?.(0, list.length);
  for (const p of list) {
    await loadImageInternal(p);
    loaded++;
    onProgress?.(loaded, list.length);
  }
}

/** 把一批预加载工作丢到浏览器空闲时段执行,避免跟当前页面的首屏渲染/交互抢带宽。
 *  没有 requestIdleCallback 的环境(如 Safari)退化为短延时。 */
export function idlePreload(fn: () => void) {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (ric) ric(fn);
  else window.setTimeout(fn, 200);
}

/** 全局图片/视频预加载编排:决定「该预取什么、什么时候预取」,机制本身见 preload.ts。
 *  由 App.tsx 在 page/currentChapter 变化时调用,各页面组件不需要各自操心。 */
import { CHARACTERS, ITEMS, STORY, ENDING_IMAGES, ENDING_VIDEOS } from "../data";
import type { Beat } from "../data/types";
import { CASE_TRIAGE_IMG, BAMBOO_TABLE_IMG, WOODENBOX_TABLE_IMG, CLINIC_TABLE_IMG } from "../pages/MiniGamePage";
import { idlePreload, loadAll, loadSequential, preloadImages, preloadVideos } from "./preload";

/** 收集一章 beats 树(含 ifKey 分支/探索热点/小游戏解锁图)里所有会用到的插图路径。 */
export function collectChapterImagePaths(beats: Beat[]): string[] {
  const out: string[] = [];
  const walk = (bs: Beat[]) => {
    for (const beat of bs) {
      if ("image" in beat && beat.image) out.push(beat.image);
      if ("game" in beat && beat.game.nextBeatUnlockedImage) out.push(beat.game.nextBeatUnlockedImage);
      if ("ifKey" in beat) walk(beat.beats);
      if ("explore" in beat) {
        if (beat.explore.image) out.push(beat.explore.image);
        for (const hotspot of beat.explore.hotspots) {
          if (hotspot.image) out.push(hotspot.image);
        }
      }
    }
  };
  walk(beats);
  return out;
}

/** 预取某一章的全部插图(预测性地提前拿下一章,后台静默、不阻塞)。 */
export function preloadChapterAssets(chapterNum: number) {
  const chapter = STORY[`ch${chapterNum}`];
  if (!chapter) return;
  idlePreload(() => preloadImages(collectChapterImagePaths(chapter.beats)));
}

/** 进入该章节时硬阻塞等待——按 beats 顺序依次加载完该章会用到的所有插图,
 *  resolve 前页面应展示"加载中"提示。已经被后台预取过的图(见 preloadChapterAssets/preloadGlobalTier)
 *  会命中同一份 in-flight 缓存,基本立即完成,不会重新发请求。 */
export async function loadChapterAssetsSequential(
  chapterNum: number,
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  const chapter = STORY[`ch${chapterNum}`];
  if (!chapter) { onProgress?.(0, 0); return; }
  await loadSequential(collectChapterImagePaths(chapter.beats), onProgress);
}

let globalTierPreloaded = false;
/** 体量小、迟早都要用到的素材:角色头像、物品图标、小游戏背景、结局插图。
 *  整局只需跑一次,丢进浏览器空闲时段,不抢首屏带宽。 */
export function preloadGlobalTier() {
  if (globalTierPreloaded) return;
  globalTierPreloaded = true;
  idlePreload(() => {
    preloadImages(Object.values(CHARACTERS).map(c => c.portrait));
    preloadImages(Object.values(ITEMS).map(it => it.image));
    preloadImages([CASE_TRIAGE_IMG, BAMBOO_TABLE_IMG, WOODENBOX_TABLE_IMG, CLINIC_TABLE_IMG]);
    preloadImages(Object.values(ENDING_IMAGES));
  });
}

/** 「典故卷宗」(章节滑动选择页)用得到的资源:已开放卷的封面视频 + 未开放卷的占位封面图。 */
export function preloadVolumeSelectAssets() {
  idlePreload(() => {
    preloadVideos(["/videos/levels/1/dungeon_cover_huatuo.mp4"]);
    preloadImages([
      "/images/levels/2/cover.png",
      "/images/levels/3/cover.png",
      "/images/levels/4/cover.png",
      "/images/levels/5/cover.png",
    ]);
  });
}

/** 封面页:大概率紧接着会点「开始修补」播放开场动画。 */
export function preloadIntroVideo() {
  idlePreload(() => preloadVideos(["/videos/start.mp4"]));
}

/** 临近终章(第4/5章)时提前拿全部结局视频——具体会触发哪个要等玩家选完才知道,4 个一起预取。 */
export function preloadEndingVideos() {
  idlePreload(() => preloadVideos(Object.values(ENDING_VIDEOS)));
}

/** 启动阶段(工作室 LOGO 展示期间)要硬阻塞等完的素材:首页封面图/视频 + 典故卷宗页每一卷的封面图/视频。
 *  这批是「一进游戏就可能看到」的内容,在 LOGO 还停留的时候就在后台并行加载,加载页面本身不需要它们。 */
const BOOT_IMAGE_PATHS = [
  "/images/cover.jpg",
  "/images/levels/1/chapters/dungeon_cover_huatuo.webp",
  "/images/levels/2/cover.png",
  "/images/levels/3/cover.png",
  "/images/levels/4/cover.png",
  "/images/levels/5/cover.png",
];
const BOOT_VIDEO_PATHS = [
  "/videos/cover.mp4",
  "/videos/start.mp4",
  "/videos/levels/1/dungeon_cover_huatuo.mp4",
];

export async function loadBootAssets(): Promise<void> {
  await Promise.all([
    loadAll(BOOT_IMAGE_PATHS, "image"),
    loadAll(BOOT_VIDEO_PATHS, "video"),
  ]);
}

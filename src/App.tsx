import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  CoverPage, WorldPage, VolumeSelectPage, ChapterSelectPage,
  ShowcasePage,
  StoryPage, MiniGamePage, DungeonStatusPage, TrustRoutePage,
  ProgressPage, EndingPage, GalleryPage,
} from "./pages";
import { BootScreen, SideNav, ValueChangeStack, type ValueDelta } from "./components";
import { resolveEnding } from "./data";
import type { GameState } from "./data/types";
import { loadState, saveState } from "./lib/storage";
import { bgmPath, playBgm, playSfx, primeAudio, stopBgm, type SfxName } from "./lib/audio";
import type { PageKey } from "./lib/routes";
import {
  loadBootAssets, preloadChapterAssets, preloadGlobalTier, preloadIntroVideo, preloadVolumeSelectAssets,
} from "./lib/assetPreload";

/** 启动画面(工作室 LOGO)最短停留时长——避免素材命中缓存时一闪而过。 */
const MIN_BOOT_MS = 800;
/** 启动画面退场的淡出动画时长,需与 CSS .boot-screen 的 transition 一致。 */
const BOOT_EXIT_MS = 420;
const SFX_SELECTOR = "[data-sfx], .press, .choice, .navitem, .btn-primary, .btn-ghost, .icon-btn";

/** Pages that share the same chapter BGM — switching among them keeps the music playing. */
const BGM_PAGES: PageKey[] = ["story", "minigame"];

/** 剧情外界面统一主题曲（封面/序幕/卷宗/设定/档案/图鉴/线索板/进程）。 */
const MENU_THEME = "/audio/menu_theme.mp3";
/** 自带音频/留白、不放主题曲的页面：结局(旁白配音)、信任抉择(留白)、典故卷宗(自行接管为第一章 BGM，避免与主题曲抢播)。 */
const NO_THEME_PAGES: PageKey[] = ["ending", "trust", "chapters"];

/** 沉浸页:无 SideNav 概念(封面/结局)。剧情页参与正常侧栏体系:默认收起=全屏 + 左上展开键,展开则显示侧栏。 */
const IMMERSIVE_PAGES: PageKey[] = ["cover", "ending"];

/** 由右上角快捷菜单进入的页面:右上角显示「退出」按钮,返回剧情。 */
const QUICKMENU_PAGES: PageKey[] = ["map", "clue", "gallery"];

/** Delegated click sound: plays the target's `data-sfx`, or "tap" for any other pressable element. */
function handleScreenClick(e: MouseEvent<HTMLDivElement>) {
  primeAudio();
  const target = (e.target as HTMLElement).closest<HTMLElement>(SFX_SELECTOR);
  if (!target || (target as HTMLButtonElement).disabled) return;
  playSfx((target.dataset.sfx as SfxName) || "tap");
}

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [page, setPage] = useState<PageKey>("cover");
  const [transKey, setTransKey] = useState(0);
  // 启动画面:先亮工作室 LOGO,期间把首页封面/视频 + 典故卷宗每卷封面/视频加载完。
  // 素材就绪后切到「点击屏幕继续」,等玩家点一下再淡出进封面页(避免一闪而过、也顺带满足浏览器自动播放策略的用户手势要求)。
  const [booted, setBooted] = useState(false);
  const [bootReady, setBootReady] = useState(false);
  const [bootExiting, setBootExiting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    loadBootAssets().then(() => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_BOOT_MS - (Date.now() - start));
      window.setTimeout(() => { if (!cancelled) setBootReady(true); }, wait);
    });
    return () => { cancelled = true; };
  }, []);
  const continueBoot = () => {
    if (bootExiting) return;
    setBootExiting(true);
    window.setTimeout(() => setBooted(true), BOOT_EXIT_MS);
  };
  const [navCollapsed, setNavCollapsed] = useState(false);
  // 侧栏悬停展开 / 移开自动收缩：延时收缩，避免指针从展开按钮移入侧栏途中的间隙误触收起。
  const navCollapseTimer = useRef<number>(0);
  const cancelNavCollapse = () => {
    if (navCollapseTimer.current) { window.clearTimeout(navCollapseTimer.current); navCollapseTimer.current = 0; }
  };
  const expandNav = () => { cancelNavCollapse(); setNavCollapsed(false); };
  const scheduleNavCollapse = () => {
    cancelNavCollapse();
    navCollapseTimer.current = window.setTimeout(() => setNavCollapsed(true), 200);
  };
  useEffect(() => cancelNavCollapse, []);
  // 数值变化提示在 App 层持有：放在 key={transKey} 的换页包裹层之外，
  // 这样即便选择后立刻转场/换章导致 StoryPage 重挂载，提示仍能完整存活其生命周期。
  const [valueDeltas, setValueDeltas] = useState<ValueDelta[]>([]);

  // BGM 由 App 统一管理：剧情/小游戏=章节 BGM；结局(旁白)/信任(留白)=停；其余剧情外界面=主题曲。
  // 同源 src 时 playBgm 为 no-op，故主题曲在各菜单页间连续不断。
  // 注：封面页(cover)的开场动画阶段由 CoverPage 自行停 BGM 让视频出声。
  useEffect(() => {
    if (BGM_PAGES.includes(page)) {
      const src = bgmPath(state.currentChapter || 1);
      if (src) playBgm(src);
    } else if (NO_THEME_PAGES.includes(page)) {
      stopBgm();
    } else {
      playBgm(MENU_THEME);
    }
  }, [page, state.currentChapter]);

  // 全局小体量素材(头像/物品图标/小游戏背景/结局插图):App 一启动就丢进空闲时段预取一次。
  useEffect(() => { preloadGlobalTier(); }, []);

  // 预测性预加载:按当前页面提前拿"大概率下一步会看到"的资源,真正进入那个页面时已经在缓存里。
  useEffect(() => {
    if (page === "cover") {
      preloadIntroVideo();
      preloadChapterAssets(1); // 「开始修补」之后大概率落到第一章
    } else if (page === "dungeon" || page === "chapters") {
      preloadVolumeSelectAssets();
      preloadChapterAssets(state.currentChapter || 1);
    }
    // story 页面内部已自行预取当前章 + 下一章 + 终章结局视频,这里不重复。
  }, [page, state.currentChapter]);

  const gotoPage = (p: PageKey) => {
    setPage(p);
    setTransKey(k => k + 1);
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".page-scroll, .page-shell-body").forEach(el => { el.scrollTop = 0; });
    }, 30);
  };

  const gotoEnding = () => {
    // Resolve from the freshest state via the functional updater: the ch4 choice
    // commits `finalChoice` just before this fires, and a stale `state` closure
    // would otherwise always fall back to the default ending.
    setState(prev => {
      const ns: GameState = { ...prev, lastEnding: resolveEnding(prev) };
      // 典故信物：与华佗羁绊≥3，结局达成时由华佗亲手授予「华佗手书残句」，点亮《拾遗残卷》。
      if ((prev.huatuo_trust || 0) >= 3 && !prev.items.includes("huatuo_manuscript")) {
        ns.items = [...prev.items, "huatuo_manuscript"];
      }
      saveState(ns);
      return ns;
    });
    gotoPage("ending");
  };

  if (!booted) {
    return (
      <div className="stage">
        <div className="phone">
          <div className="screen" onClick={handleScreenClick}>
            <BootScreen exiting={bootExiting} ready={bootReady} onContinue={continueBoot} />
          </div>
        </div>
      </div>
    );
  }

  let pageEl: React.ReactNode = null;
  switch (page) {
    case "cover":
      pageEl = <CoverPage
        onStart={() => { setNavCollapsed(true); gotoPage("chapters"); }}
      />;
      break;
    case "showcase":
      pageEl = <ShowcasePage
        onBack={() => gotoPage("cover")}
        onEnter={() => gotoPage("chapters")}
      />;
      break;
    case "world":
      pageEl = <WorldPage
        onBack={() => gotoPage("cover")}
        onEnter={() => gotoPage("chapters")}
      />;
      break;
    case "dungeon":
      pageEl = <VolumeSelectPage
        onBack={() => gotoPage("cover")}
        onEnterFirst={() => gotoPage("chapters")}
      />;
      break;
    case "chapters":
      pageEl = <ChapterSelectPage
        state={state}
        onBack={() => gotoPage("cover")}
        onEnter={() => {
          if (!state.currentChapter) {
            const ns: GameState = { ...state, currentChapter: 1 };
            setState(ns);
            saveState(ns);
          }
          gotoPage("story");
        }}
      />;
      break;
    case "story":
      pageEl = <StoryPage state={state} setState={setState}
        gotoPage={gotoPage} gotoEnding={gotoEnding}
        onValueDeltas={setValueDeltas}/>;
      break;
    case "minigame":
      pageEl = <MiniGamePage state={state} setState={setState} gotoPage={gotoPage}
        onValueDeltas={setValueDeltas}/>;
      break;
    case "clue":
      pageEl = <DungeonStatusPage state={state} gotoPage={gotoPage}/>;
      break;
    case "trust":
      pageEl = <TrustRoutePage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "map":
      pageEl = <ProgressPage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "ending":
      pageEl = <EndingPage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "gallery":
      pageEl = <GalleryPage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    default:
      pageEl = (
        <div className="page night-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{color:"var(--paper)"}}>页面未找到</div>
        </div>
      );
  }

  const showNav = !IMMERSIVE_PAGES.includes(page);
  // 侧栏开启:双列;收起或沉浸页:单列全宽(完全无侧栏)。
  const sideOpen = showNav && !navCollapsed;
  const shellClass = sideOpen ? "app-shell" : "app-shell app-shell--immersive";

  return (
    <div className="stage">
      <div className="phone">
        <div className="screen" onClick={handleScreenClick}>
          <div className={shellClass}>
            {showNav && (
              <SideNav
                active={page}
                open={sideOpen}
                onNav={gotoPage}
                onCollapse={() => setNavCollapsed(true)}
                onMouseEnter={cancelNavCollapse}
                onMouseLeave={scheduleNavCollapse}
              />
            )}
            <div className="app-main">
              {/* 收起态:左上角浮动展开按钮(仅桌面端;移动端无持久侧栏) */}
              {showNav && navCollapsed && (
                <button
                  className="nav-expand-btn press"
                  data-sfx="nav"
                  onMouseEnter={expandNav}
                  onClick={expandNav}
                  aria-label="展开导航"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 2 L9 7 L3 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 2 L12 7 L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                </button>
              )}
              {/* 退出按钮:从右上角快捷菜单进入的页面(进程/线索板/图鉴),右上角返回剧情 */}
              {QUICKMENU_PAGES.includes(page) && (
                <button
                  className="quick-exit-btn press"
                  data-sfx="back"
                  onClick={() => gotoPage("story")}
                  aria-label="退出，返回剧情"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3 L11 11 M11 3 L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <div key={transKey} style={{position:"absolute", inset: 0, animation: "fadeIn 380ms ease both"}}>
                {pageEl}
              </div>
              {/* 数值变化提示:位于换页包裹层之外,不随 StoryPage 重挂载而被销毁 */}
              <ValueChangeStack deltas={valueDeltas} onClear={() => setValueDeltas([])} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

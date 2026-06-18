import { useEffect, useState, type MouseEvent } from "react";
import {
  CoverPage, WorldPage, VolumeSelectPage, ChapterSelectPage,
  ShowcasePage,
  StoryPage, MiniGamePage, DungeonStatusPage, TrustRoutePage,
  ProgressPage, EndingPage, GalleryPage,
} from "./pages";
import { SideNav } from "./components";
import { resolveEnding } from "./data";
import type { GameState } from "./data/types";
import { loadState, saveState } from "./lib/storage";
import { bgmPath, playBgm, playSfx, primeAudio, stopBgm, type SfxName } from "./lib/audio";
import type { PageKey } from "./lib/routes";
const SFX_SELECTOR = "[data-sfx], .press, .choice, .navitem, .btn-primary, .btn-ghost, .icon-btn";

/** Pages that share the same chapter BGM — switching among them keeps the music playing. */
const BGM_PAGES: PageKey[] = ["story", "minigame"];

/** 沉浸页:无 SideNav 概念(封面/结局)。剧情页参与正常侧栏体系:默认收起=全屏 + 左上展开键,展开则显示侧栏。 */
const IMMERSIVE_PAGES: PageKey[] = ["cover", "ending"];

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
  const [navCollapsed, setNavCollapsed] = useState(false);

  // 章节 BGM 由 App 统一管理，跨越剧情↔小游戏的页面切换持续播放（同源 src 时 playBgm 为 no-op）。
  useEffect(() => {
    if (BGM_PAGES.includes(page)) {
      const src = bgmPath(state.currentChapter || 1);
      if (src) playBgm(src);
    } else {
      stopBgm();
    }
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
      saveState(ns);
      return ns;
    });
    gotoPage("ending");
  };

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
        gotoPage={gotoPage} gotoEnding={gotoEnding}/>;
      break;
    case "minigame":
      pageEl = <MiniGamePage state={state} setState={setState} gotoPage={gotoPage}/>;
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
            {sideOpen && (
              <SideNav
                active={page}
                onNav={gotoPage}
                onCollapse={() => setNavCollapsed(true)}
              />
            )}
            <div className="app-main">
              {/* 收起态:左上角浮动展开按钮(仅桌面端;移动端无持久侧栏) */}
              {showNav && navCollapsed && (
                <button
                  className="nav-expand-btn press"
                  data-sfx="nav"
                  onClick={() => setNavCollapsed(false)}
                  aria-label="展开导航"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 2 L9 7 L3 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 2 L12 7 L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                </button>
              )}
              <div key={transKey} style={{position:"absolute", inset: 0, animation: "fadeIn 380ms ease both"}}>
                {pageEl}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

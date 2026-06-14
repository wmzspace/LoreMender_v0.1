import { useState } from "react";
import {
  CoverPage, WorldPage, ChapterSelectPage,
  StoryPage, CluePage, TrustRoutePage,
  ProgressPage, EndingPage, GalleryPage,
} from "./pages";
import { resolveEnding } from "./data";
import type { GameState } from "./data/types";
import { loadState, saveState } from "./lib/storage";
import type { PageKey } from "./lib/routes";

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [page, setPage] = useState<PageKey>("cover");
  const [transKey, setTransKey] = useState(0);

  const gotoPage = (p: PageKey) => {
    setPage(p);
    setTransKey(k => k + 1);
    setTimeout(() => {
      const sc = document.querySelector(".page-scroll");
      if (sc) sc.scrollTop = 0;
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
        onStart={() => gotoPage("dungeon")}
        onWorld={() => gotoPage("world")}
      />;
      break;
    case "world":
      pageEl = <WorldPage
        onBack={() => gotoPage("cover")}
        onEnter={() => gotoPage("dungeon")}
      />;
      break;
    case "dungeon":
      pageEl = <ChapterSelectPage
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
    case "clue":
      pageEl = <CluePage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "trust":
      pageEl = <TrustRoutePage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "map":
      pageEl = <ProgressPage state={state} gotoPage={gotoPage}/>;
      break;
    case "ending":
      pageEl = <EndingPage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "gallery":
      pageEl = <GalleryPage state={state} gotoPage={gotoPage}/>;
      break;
    default:
      pageEl = (
        <div className="page night-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{color:"var(--paper)"}}>页面未找到</div>
        </div>
      );
  }

  return (
    <div className="stage">
      <div className="phone">
        <div className="phone-notch"/>
        <div className="screen">
          <div key={transKey} style={{position:"absolute", inset: 0, animation: "fadeIn 380ms ease both"}}>
            {pageEl}
          </div>
        </div>
      </div>
    </div>
  );
}

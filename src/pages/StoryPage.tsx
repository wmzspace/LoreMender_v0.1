import { useEffect, useMemo, useState } from "react";
import {
  BottomNav, ChoiceList, DialogueBox, ProgressDots, SceneFrame, Toast,
} from "../components";
import {
  SceneClinic, SceneRaid, SceneTrust, SceneFinal,
} from "../components/art";
import { CHARACTERS, STORY } from "../data";
import type { Choice, GameState } from "../data/types";
import { saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface StoryPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
  gotoEnding: () => void;
}

export function StoryPage({ state, setState, gotoPage, gotoEnding }: StoryPageProps) {
  const ch = state.currentChapter || 1;
  const chKey = "ch" + ch;
  const chapter = STORY[chKey];

  const [beatIdx, setBeatIdx] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setBeatIdx(0);
  }, [ch]);

  const beats = chapter?.beats || [];
  const beat = beats[beatIdx];

  // Beats that only redirect (no speaker/line/choices) carry no visible text.
  const isTransition = !!beat && (
    "gotoChapter" in beat || "gotoTrust" in beat || "gotoEnding" in beat
  );

  const runTransition = (b: typeof beat): boolean => {
    if (!b) return false;
    if ("gotoChapter" in b && b.gotoChapter === "clue") {
      gotoPage("clue");
      return true;
    }
    if ("gotoChapter" in b && b.gotoChapter) {
      const nextCh = parseInt(b.gotoChapter.replace("ch", ""), 10);
      const ns = { ...state, currentChapter: nextCh };
      setState(ns);
      saveState(ns);
      setBeatIdx(0);
      return true;
    }
    if ("gotoTrust" in b && b.gotoTrust) {
      gotoPage("trust");
      return true;
    }
    if ("gotoEnding" in b && b.gotoEnding) {
      gotoEnding();
      return true;
    }
    return false;
  };

  // Fire redirect beats automatically rather than rendering an empty dialogue
  // box the player would have to tap through.
  useEffect(() => {
    if (isTransition) runTransition(beat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat]);

  const next = () => {
    if (!beat) return;
    if (runTransition(beat)) return;
    setBeatIdx(i => Math.min(beats.length - 1, i + 1));
  };

  const choose = (c: Choice) => {
    if (c.toast) setToast(c.toast);
    const ns: GameState = { ...state, ...(c.set || {}) };
    setState(ns);
    saveState(ns);
    setTimeout(() => setBeatIdx(i => Math.min(beats.length - 1, i + 1)), 300);
  };

  const sceneEl = useMemo(() => {
    const s = chapter?.scene;
    if (s === "clinic_night") return <SceneClinic/>;
    if (s === "raid_coming") return <SceneRaid/>;
    if (s === "find_trust") return <SceneTrust/>;
    if (s === "final_choice") return <SceneFinal/>;
    return <SceneClinic/>;
  }, [chapter]);

  const speakerName = beat && "speaker" in beat && beat.speaker
    ? CHARACTERS[beat.speaker]?.name
    : null;
  const lineText = beat && "line" in beat ? beat.line : "";
  const isNarration = !!(beat && "narration" in beat && beat.narration);
  const hasChoices = !!(beat && "choices" in beat);

  return (
    <div className="page night-deep-bg" style={{paddingBottom: 0}}>
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("dungeon")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">华佗 · 青囊残卷</div>
        <button className="icon-btn press" onClick={() => gotoPage("map")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
      </div>
      <ProgressDots total={5} current={ch}/>

      <div className="fade-in" style={{
        textAlign:"center", padding:"2px 16px 10px",
      }}>
        <div className="title-han" style={{
          fontSize: 17, color:"var(--gold-pale)",
          letterSpacing:"0.22em", textIndent:"0.22em",
          textShadow: "0 0 10px rgba(231,199,115,0.4)",
        }}>{chapter?.title}</div>
      </div>

      <SceneFrame height={220}>{sceneEl}</SceneFrame>

      <div style={{
        flex: 1, overflowY:"auto",
        display:"flex", flexDirection:"column",
        paddingBottom: `calc(20px + var(--safe-bottom) + 64px)`,
      }} className="no-scrollbar">
        <div style={{margin: "auto 0", padding: "16px 0"}}>
          {hasChoices && beat && "choices" in beat ? (
            <div className="fade-up">
              <div style={{
                padding:"0 18px 8px",
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 12, color:"var(--gold-pale)",
                letterSpacing:"0.36em", textIndent:"0.36em",
                opacity: 0.85, textAlign:"center",
              }}>· 抉 择 ·</div>
              <ChoiceList choices={beat.choices} onChoose={choose}/>
            </div>
          ) : isTransition ? null : (
            <div className="fade-in">
              <DialogueBox
                speaker={speakerName}
                text={lineText}
                isNarration={isNarration}
                onTap={next}
              />
              <div style={{
                textAlign:"center", marginTop: 12,
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 11, opacity: 0.5,
                letterSpacing:"0.4em",
              }}>· 轻触 继续 ·</div>
            </div>
          )}
        </div>
      </div>

      <Toast text={toast} onDone={() => setToast("")}/>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="story" onNav={gotoPage}/>
      </div>
    </div>
  );
}

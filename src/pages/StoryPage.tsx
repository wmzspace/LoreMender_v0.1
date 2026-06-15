import { useEffect, useMemo, useState } from "react";
import {
  BottomNav, ChoiceList, DialogueBox, ProgressDots, SceneFrame, Toast, Topbar,
} from "../components";
import {
  SceneClinic, SceneRaid, SceneTrust, SceneFinal,
} from "../components/art";
import { CHARACTERS, LEVEL_ASSET_PLANS, STORY } from "../data";
import type { Choice, GameState } from "../data/types";
import { loadBeat, saveBeat, saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface StoryPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
  gotoEnding: () => void;
}

function AiSceneImage({ chapter }: { chapter: number }) {
  const [loaded, setLoaded] = useState(false);
  const asset = LEVEL_ASSET_PLANS.find(level => level.chapter === chapter);
  const imagePath = asset?.imagePath;
  useEffect(() => {
    setLoaded(false);
  }, [imagePath]);

  if (!asset) return null;

  return (
    <img
      key={asset.imagePath}
      src={asset.imagePath}
      alt={`${asset.title} AI 场景插图`}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: loaded ? 1 : 0,
        transition: "opacity 360ms ease",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}

export function StoryPage({ state, setState, gotoPage, gotoEnding }: StoryPageProps) {
  const ch = state.currentChapter || 1;
  const chKey = "ch" + ch;
  const chapter = STORY[chKey];

  // Resume at the saved beat for this chapter (set when re-mounting after a
  // tab switch); a new chapter / new game returns 0 via the chapter tag.
  const [beatIdx, setBeatIdx] = useState(() => loadBeat(ch));
  const [toast, setToast] = useState("");

  // Persist reading position so leaving the story tab (线索/进程/图鉴) and
  // returning resumes here instead of replaying the chapter from the top.
  useEffect(() => {
    saveBeat(ch, beatIdx);
  }, [ch, beatIdx]);

  const beats = chapter?.beats || [];
  const beat = beats[beatIdx];

  // Redirect beats (no speaker/line/choices) carry no visible text.
  const isTransitionBeat = (b: typeof beat): boolean =>
    !!b && ("gotoChapter" in b || "gotoTrust" in b || "gotoEnding" in b);
  const isTransition = isTransitionBeat(beat);

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

  // Advance to an index, auto-resolving redirect beats so the player never
  // lands on an empty (text-less) transition beat and has to tap through it.
  const goToIndex = (idx: number) => {
    let clamped = Math.min(beats.length - 1, idx);
    // Skip a `gotoTrust` detour that's already been satisfied. ch4 routes
    // through the trust screen mid-chapter; confirming it remounts StoryPage at
    // beat 0, so without this guard we'd replay up to `gotoTrust` and reopen
    // the trust screen forever. The trust screen now sets finalChoice (the
    // binding decision, incl. "burn"), so once that's set we walk past it.
    while (
      clamped < beats.length - 1 &&
      (() => { const t = beats[clamped]; return !!t && "gotoTrust" in t && !!t.gotoTrust && !!state.finalChoice; })()
    ) {
      clamped++;
    }
    const target = beats[clamped];
    if (isTransitionBeat(target)) {
      runTransition(target);
      return;
    }
    setBeatIdx(clamped);
  };

  const next = () => {
    if (!beat) return;
    if (runTransition(beat)) return;
    goToIndex(beatIdx + 1);
  };

  const choose = (c: Choice) => {
    if (c.toast) setToast(c.toast);
    const ns: GameState = { ...state, ...(c.set || {}) };
    setState(ns);
    saveState(ns);
    setTimeout(() => goToIndex(beatIdx + 1), 300);
  };

  const sceneEl = useMemo(() => {
    const s = chapter?.scene;
    if (s === "clinic_night" || s === "xuchang_prison") return <SceneClinic/>;
    if (s === "raid_coming" || s === "three_places" || s === "cao_mansion") return <SceneRaid/>;
    if (s === "find_trust") return <SceneTrust/>;
    if (s === "final_choice" || s === "huatuo_cell") return <SceneFinal/>;
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
      <Topbar
        title="华佗 · 青囊残卷"
        onBack={() => gotoPage("dungeon")}
        right={
          <button className="icon-btn press" onClick={() => gotoPage("map")} aria-label="副本进程">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        }
      />
      <ProgressDots total={5} current={ch}/>

      <div className="fade-in" style={{
        textAlign:"center", padding:"2px 16px 10px",
      }}>
        <div className="title-han" style={{
          fontSize: 17, color:"var(--gold-pale)",
          letterSpacing:"0.22em", textIndent:"0.22em",
          textShadow: "0 0 10px rgba(236,220,166,0.4)",
        }}>{chapter?.title}</div>
      </div>

      <SceneFrame height={220}>
        {sceneEl}
        <AiSceneImage chapter={ch} />
      </SceneFrame>

      <div style={{
        flex: 1, overflowY:"auto",
        paddingBottom: `calc(20px + var(--safe-bottom) + 64px)`,
      }} className="no-scrollbar">
        <div style={{padding: "18px 0 0"}}>
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

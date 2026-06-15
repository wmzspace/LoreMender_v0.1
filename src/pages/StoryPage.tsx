import { useEffect, useMemo, useState } from "react";
import {
  BottomNav, ChoiceList, DialogueBox, ProgressDots, SceneFrame, SoundToggle, Toast, Topbar,
} from "../components";
import {
  SceneClinic, SceneRaid, SceneTrust, SceneFinal,
} from "../components/art";
import { CHARACTERS, LEVEL_ASSET_PLANS, STORY } from "../data";
import type { Choice, GameState } from "../data/types";
import { bgmPath, dialogueAudioPath, playBgm, playDialogueAudio, stopBgm, stopDialogueAudio } from "../lib/audio";
import { loadBeat, saveBeat, saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface StoryPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
  gotoEnding: () => void;
}

/** Beat-level illustration map: chapter -> beatIndex -> image path
 *  Beat indices align with the beats[] array in story.ts.
 *  Transition beats (gotoChapter / gotoTrust / gotoEnding) are skipped.
 */
const BEAT_IMAGES: Record<string, Record<number, string>> = {
  // 第一章 · 牢狱初醒 (beats 0-7, beat 8 = gotoChapter)
  ch1: {
    0: "/images/levels/1/chapters/ch1_beats/beat01_darkness_straw.webp",
    1: "/images/levels/1/chapters/ch1_beats/beat02_waking.webp",
    2: "/images/levels/1/chapters/ch1_beats/beat03_silhouette.webp",
    3: "/images/levels/1/chapters/ch1_beats/beat04_bamboo_slips.webp",
    4: "/images/levels/1/chapters/ch1_beats/beat05_choice.webp",
    5: "/images/levels/1/chapters/ch1_beats/beat04_bamboo_slips.webp",
    6: "/images/levels/1/chapters/ch1_beats/beat04_bamboo_slips.webp",
    7: "/images/levels/1/chapters/ch1_beats/beat07_trust.webp",
  },
  // 第二章 · 三人之试 (beats 0-9, beat 10 = gotoChapter)
  ch2: {
    0: "/images/levels/1/chapters/ch2_beats/beat00_dawn_shop.webp",
    1: "/images/levels/1/chapters/ch2_beats/beat01_three_figures.webp",
    2: "/images/levels/1/chapters/ch2_beats/beat02_wangji.webp",
    3: "/images/levels/1/chapters/ch2_beats/beat03_wangji_suspicious.webp",
    4: "/images/levels/1/chapters/ch2_beats/beat04_chenbo.webp",
    5: "/images/levels/1/chapters/ch2_beats/beat05_chenbo_herbs.webp",
    6: "/images/levels/1/chapters/ch2_beats/beat06_xuanyin.webp",
    7: "/images/levels/1/chapters/ch2_beats/beat07_xuanyin_detached.webp",
    8: "/images/levels/1/chapters/ch2_beats/beat08_choice.webp",
    9: "/images/levels/1/chapters/ch2_beats/beat09_nightfall.webp",
  },
  // 第三章 · 曹府密谈 (beats 0-8, beat 9 = gotoChapter)
  ch3: {
    0: "/images/levels/1/chapters/ch3_beats/beat00_soldiers.webp",
    1: "/images/levels/1/chapters/ch3_beats/beat01_summons.webp",
    2: "/images/levels/1/chapters/ch3_beats/beat02_cao_hall.webp",
    3: "/images/levels/1/chapters/ch3_beats/beat03_caocao.webp",
    4: "/images/levels/1/chapters/ch3_beats/beat04_aj_small.webp",
    5: "/images/levels/1/chapters/ch3_beats/beat05_ultimatum.webp",
    6: "/images/levels/1/chapters/ch3_beats/beat06_choice.webp",
    7: "/images/levels/1/chapters/ch3_beats/beat07_three_days.webp",
    8: "/images/levels/1/chapters/ch3_beats/beat08_return.webp",
  },
  // 第四章 · 青囊抉择 (beats 0-6, beat 3 = gotoTrust, beat 7 = gotoChapter)
  ch4: {
    0: "/images/levels/1/chapters/ch4_beats/beat00_dying_candle.webp",
    1: "/images/levels/1/chapters/ch4_beats/beat01_huatuo_asking.webp",
    2: "/images/levels/1/chapters/ch4_beats/beat02_hesitate.webp",
    // beat 3 = gotoTrust (transition, no image needed)
    4: "/images/levels/1/chapters/ch4_beats/beat04_huatuo_accept.webp",
    5: "/images/levels/1/chapters/ch4_beats/beat05_last_slip.webp",
    6: "/images/levels/1/chapters/ch4_beats/beat06_final_wisdom.webp",
  },
  // 第五章 · 千年回响 (beats 0-5, beat 6 = gotoEnding)
  ch5: {
    0: "/images/levels/1/chapters/ch5_beats/beat00_dawn_drum.webp",
    1: "/images/levels/1/chapters/ch5_beats/beat01_aj_question.webp",
    2: "/images/levels/1/chapters/ch5_beats/beat02_huatuo_wisdom.webp",
    3: "/images/levels/1/chapters/ch5_beats/beat03_glowing_slip.webp",
    4: "/images/levels/1/chapters/ch5_beats/beat04_choice.webp",
    5: "/images/levels/1/chapters/ch5_beats/beat05_farewell.webp",
  },
};

/** Preload images into browser cache via off-screen Image objects. */
const _preloaded = new Set<string>();
function preloadImages(paths: string[]) {
  for (const p of paths) {
    if (_preloaded.has(p)) continue;
    _preloaded.add(p);
    const img = new Image();
    img.src = p;
  }
}

/** Collect all image paths for a given chapter key */
function chapterImagePaths(chKey: string): string[] {
  const map = BEAT_IMAGES[chKey];
  if (!map) return [];
  return Object.values(map);
}

/** Resolve the image path for a given chapter + beat index */
function resolveImagePath(chapter: number, beatIdx: number): string | undefined {
  const chKey = "ch" + chapter;
  const beatImage = BEAT_IMAGES[chKey]?.[beatIdx];
  const asset = LEVEL_ASSET_PLANS.find(level => level.chapter === chapter);
  return beatImage || asset?.imagePath;
}

/**
 * Double-buffered scene image: keeps the previous image visible underneath
 * while the new one loads and fades in on top. This eliminates blank gaps
 * entirely — the player always sees *something*.
 */
function AiSceneImage({ chapter, beatIdx }: { chapter: number; beatIdx: number }) {
  const imagePath = resolveImagePath(chapter, beatIdx);

  // Current (new) image loaded state
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(imagePath);
  const [currentLoaded, setCurrentLoaded] = useState(false);
  // Previous image stays visible until new one finishes loading
  const [prevSrc, setPrevSrc] = useState<string | undefined>();

  // Preload full chapter + next chapter's first beat on mount
  useEffect(() => {
    const chKey = "ch" + chapter;
    const paths = chapterImagePaths(chKey);
    const nextChKey = "ch" + (chapter + 1);
    const nextFirst = BEAT_IMAGES[nextChKey]?.[0];
    if (nextFirst) paths.push(nextFirst);
    preloadImages(paths);
  }, [chapter]);

  // Handle beat change: keep old image, start loading new one on top
  useEffect(() => {
    if (!imagePath) return;
    if (imagePath === currentSrc) return; // same image, no-op

    // Check if already in cache (preloaded or visited before)
    const testImg = new Image();
    testImg.src = imagePath;
    if (testImg.complete) {
      // Instant cache hit — swap immediately, no blank
      setPrevSrc(currentSrc);
      setCurrentSrc(imagePath);
      setCurrentLoaded(true);
    } else {
      // Need to load — keep old image visible, overlay new when ready
      setPrevSrc(currentSrc);
      setCurrentSrc(imagePath);
      setCurrentLoaded(false);
    }
  }, [imagePath, currentSrc]);

  if (!currentSrc && !prevSrc) return null;

  return (
    <>
      {/* Previous image (stays visible underneath until new one fades in) */}
      {prevSrc && (
        <img
          src={prevSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 1,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Current image (fades in on top once loaded) */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={`章节${chapter} 剧情插图`}
          onLoad={() => setCurrentLoaded(true)}
          onError={() => setCurrentLoaded(false)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: currentLoaded ? 1 : 0,
            transition: "opacity 360ms ease",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}
    </>
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

  // Auto-play the pre-generated narration/dialogue audio for the current beat.
  useEffect(() => {
    if (!beat || isTransition || hasChoices) {
      stopDialogueAudio();
      return;
    }
    playDialogueAudio(dialogueAudioPath(ch, beatIdx));
    return () => stopDialogueAudio();
  }, [beat, ch, beatIdx, isTransition, hasChoices]);

  // Loop the chapter's BGM in the background while reading this chapter.
  useEffect(() => {
    const src = bgmPath(ch);
    if (src) playBgm(src);
    return () => stopBgm();
  }, [ch]);

  return (
    <div className="page night-deep-bg" style={{paddingBottom: 0}}>
      <Topbar
        title="华佗 · 青囊残卷"
        onBack={() => gotoPage("dungeon")}
        right={
          <>
            <SoundToggle/>
            <button className="icon-btn press" onClick={() => gotoPage("map")} aria-label="副本进程">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </>
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
        <AiSceneImage chapter={ch} beatIdx={beatIdx} />
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

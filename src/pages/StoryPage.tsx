import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  BottomNav, ChoiceList, DialogueBox, ProgressDots, SceneFrame, SoundToggle, Toast, Topbar,
} from "../components";
import { SceneClinic, SceneFinal, SceneRaid } from "../components/art";
import { CHARACTERS, LEVEL_ASSET_PLANS, STORY } from "../data";
import type { Beat, Choice, GameState } from "../data/types";
import { bgmPath, dialogueAudioPath, playBgm, playDialogueAudio, stopBgm, stopDialogueAudio } from "../lib/audio";
import { loadBeat, saveBeat, saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface StoryPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
  gotoEnding: () => void;
}

const BEAT_IMAGES: Record<string, Record<number, string>> = {
  ch1: {
    0: "/images/levels/1/chapters/ch1_beats/beat01_darkness_straw.webp",
    1: "/images/levels/1/chapters/ch1_beats/beat02_waking.webp",
    2: "/images/levels/1/chapters/ch1_beats/beat03_silhouette.webp",
    3: "/images/levels/1/chapters/ch1_beats/beat04_bamboo_slips.webp",
    7: "/images/levels/1/chapters/ch1_beats/beat05_choice.webp",
    11: "/images/levels/1/chapters/ch1_beats/beat07_trust.webp",
  },
  ch2: {
    0: "/images/levels/1/chapters/ch2_beats/beat00_dawn_shop.webp",
    1: "/images/levels/1/chapters/ch2_beats/beat04_chenbo.webp",
    5: "/images/levels/1/chapters/ch2_beats/beat08_choice.webp",
  },
  ch3: {
    0: "/images/levels/1/chapters/ch3_beats/beat02_cao_hall.webp",
    1: "/images/levels/1/chapters/ch3_beats/beat03_caocao.webp",
    4: "/images/levels/1/chapters/ch3_beats/beat06_choice.webp",
  },
  ch4: {
    0: "/images/levels/1/chapters/ch4_beats/beat00_dying_candle.webp",
    1: "/images/levels/1/chapters/ch2_beats/beat06_xuanyin.webp",
    4: "/images/levels/1/chapters/ch5_beats/beat04_choice.webp",
  },
  ch5: {
    0: "/images/levels/1/chapters/ch5_beats/beat00_dawn_drum.webp",
    1: "/images/levels/1/chapters/ch5_beats/beat02_huatuo_wisdom.webp",
    2: "/images/levels/1/chapters/ch5_beats/beat03_glowing_slip.webp",
  },
};

const preloaded = new Set<string>();

function preloadImages(paths: string[]) {
  for (const p of paths) {
    if (preloaded.has(p)) continue;
    preloaded.add(p);
    const img = new Image();
    img.src = p;
  }
}

function chapterImagePaths(chKey: string): string[] {
  return Object.values(BEAT_IMAGES[chKey] || {});
}

function resolveImagePath(chapter: number, beatIdx: number): string | undefined {
  const chKey = "ch" + chapter;
  const map = BEAT_IMAGES[chKey] || {};
  const keys = Object.keys(map).map(Number).sort((a, b) => b - a);
  const matched = keys.find(k => k <= beatIdx);
  const asset = LEVEL_ASSET_PLANS.find(level => level.chapter === chapter);
  return matched !== undefined ? map[matched] : asset?.imagePath;
}

function AiSceneImage({ chapter, beatIdx }: { chapter: number; beatIdx: number }) {
  const imagePath = resolveImagePath(chapter, beatIdx);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(imagePath);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    preloadImages(chapterImagePaths("ch" + chapter));
  }, [chapter]);

  useEffect(() => {
    if (!imagePath || imagePath === currentSrc) return;
    setLoaded(false);
    setCurrentSrc(imagePath);
  }, [imagePath, currentSrc]);

  if (!currentSrc) return null;
  return (
    <img
      src={currentSrc}
      alt={`第${chapter}章剧情插图`}
      onLoad={() => setLoaded(true)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: loaded ? 1 : 0,
        transition: "opacity 260ms ease",
      }}
    />
  );
}

function isTransitionBeat(beat: Beat | undefined): boolean {
  return !!beat && ("gotoChapter" in beat || "gotoTrust" in beat || "gotoEnding" in beat);
}

export function StoryPage({ state, setState, gotoPage, gotoEnding }: StoryPageProps) {
  const ch = state.currentChapter || 1;
  const chKey = "ch" + ch;
  const chapter = STORY[chKey];
  const [beatIdx, setBeatIdx] = useState(() => loadBeat(ch));
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveBeat(ch, beatIdx);
  }, [ch, beatIdx]);

  const beats = chapter?.beats || [];
  const beat = beats[beatIdx];
  const gameNode = beat && "game" in beat ? beat.game : null;
  const gameDone = !!(gameNode && state.gameResults[gameNode.id]?.completed);
  const gameLocked = !!(gameNode?.requiredItem && !state.items.includes(gameNode.requiredItem));
  const isTransition = isTransitionBeat(beat);

  const runTransition = (b: Beat | undefined): boolean => {
    if (!b) return false;
    if ("gotoChapter" in b) {
      const nextCh = parseInt(b.gotoChapter.replace("ch", ""), 10);
      const ns = { ...state, currentChapter: nextCh };
      setState(ns);
      saveState(ns);
      setBeatIdx(0);
      return true;
    }
    if ("gotoTrust" in b) {
      gotoPage("trust");
      return true;
    }
    if ("gotoEnding" in b) {
      gotoEnding();
      return true;
    }
    return false;
  };

  const handleChoice = (choice: Choice) => {
    if (choice.set) {
      const ns = { ...state, ...choice.set };
      setState(ns);
      saveState(ns);
    }
    if (choice.toast) setToast(choice.toast);
    // 选择后前进到下一个 beat
    goToIndex(beatIdx + 1);
  };

  const goToIndex = (idx: number) => {
    const clamped = Math.max(0, Math.min(beats.length - 1, idx));
    const target = beats[clamped];
    if (isTransitionBeat(target)) {
      runTransition(target);
      return;
    }
    setBeatIdx(clamped);
  };

  const prev = () => {
    if (gameNode && !gameDone) return;
    goToIndex(beatIdx - 1);
  };

  const next = () => {
    if (!beat) return;
    if (gameNode && !gameDone) return;
    if (runTransition(beat)) return;
    goToIndex(beatIdx + 1);
  };

  const enterGame = () => {
    if (!gameNode || gameLocked) return;
    const ns: GameState = { ...state, activeGameId: gameNode.id };
    setState(ns);
    saveState(ns);
    gotoPage("minigame");
  };

  const onGameStoryClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!gameNode || !gameDone) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX - rect.left < rect.width / 2;
    if (isLeft) prev();
    else next();
  };

  const sceneEl = useMemo(() => {
    const scene = chapter?.scene;
    if (scene === "xuchang_prison" || scene === "street_market") return <SceneClinic />;
    if (scene === "cao_mansion" || scene === "music_house") return <SceneRaid />;
    if (scene === "old_shrine" || scene === "final_choice" || scene === "huatuo_cell") return <SceneFinal />;
    return <SceneClinic />;
  }, [chapter]);

  const speakerName = beat && "speaker" in beat ? (CHARACTERS[beat.speaker]?.name ?? null) : null;
  const lineText = beat && "line" in beat ? beat.line : "";
  const isNarration = !!(beat && "narration" in beat && beat.narration);

  useEffect(() => {
    if (!beat || isTransition || gameNode) {
      stopDialogueAudio();
      return;
    }
    playDialogueAudio(dialogueAudioPath(ch, beatIdx));
    return () => stopDialogueAudio();
  }, [beat, ch, beatIdx, isTransition, gameNode]);

  useEffect(() => {
    const src = bgmPath(ch);
    if (src) playBgm(src);
    return () => stopBgm();
  }, [ch]);

  return (
    <div className="page night-deep-bg" style={{ paddingBottom: 0 }}>
      <Topbar
        title="第一卷 · 青囊残卷"
        onBack={() => gotoPage("dungeon")}
        right={
          <>
            <SoundToggle />
            <button className="icon-btn press" onClick={() => gotoPage("map")} aria-label="第一卷进程">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </>
        }
      />
      <ProgressDots total={5} current={ch} />

      <div className="fade-in" style={{ textAlign: "center", padding: "2px 16px 10px" }}>
        <div className="title-han" style={{
          fontSize: 17,
          color: "var(--gold-pale)",
          letterSpacing: "0.22em",
          textIndent: "0.22em",
          textShadow: "0 0 10px rgba(236,220,166,0.4)",
        }}>{chapter?.title}</div>
      </div>

      <SceneFrame height={220}>
        {sceneEl}
        <AiSceneImage chapter={ch} beatIdx={beatIdx} />
      </SceneFrame>

      {gameNode && (
        <div style={{ padding: "10px 18px 0" }}>
          <button
            className={gameDone ? "btn-ghost press" : "btn-primary press"}
            disabled={gameLocked}
            onClick={enterGame}
            style={{ width: "100%", minHeight: 46 }}
          >
            {gameNode.name}
          </button>
          {gameDone && (
            <div style={{ textAlign: "center", fontSize: 11, opacity: 0.62, marginTop: 6 }}>
              已完成，可重玩刷新最佳成绩。右侧继续剧情。
            </div>
          )}
          {gameLocked && (
            <div style={{ textAlign: "center", fontSize: 11, opacity: 0.62, marginTop: 6 }}>
              尚缺少前置道具。
            </div>
          )}
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: "auto",
        paddingBottom: "calc(20px + var(--safe-bottom) + 64px)",
      }} className="no-scrollbar">
        <div style={{ padding: "18px 0 0" }}>
          {gameNode ? (
            <div
              className="fade-in"
              onClick={onGameStoryClick}
              style={{
                padding: "0 18px",
                minHeight: 96,
                display: "grid",
                placeItems: "center",
                cursor: gameDone ? "pointer" : "default",
                textAlign: "center",
                color: "rgba(228,224,208,0.72)",
                lineHeight: 1.7,
              }}
            >
              {gameDone ? gameNode.nextBeatUnlocked : "机关未解，后文仍锁在此处。"}
            </div>
          ) : isTransition ? null : "choices" in beat ? (
            <div className="fade-in" style={{ padding: "12px 0" }}>
              <ChoiceList choices={beat.choices} onChoose={handleChoice} />
            </div>
          ) : (
            <div className="fade-in">
              <DialogueBox
                speaker={speakerName}
                text={lineText}
                isNarration={isNarration}
                onPrev={prev}
                onNext={next}
              />
              <div style={{
                textAlign: "center",
                marginTop: 12,
                fontFamily: "ZCOOL XiaoWei, serif",
                fontSize: 11,
                opacity: 0.5,
                letterSpacing: "0.18em",
              }}>左侧返回 · 右侧继续</div>
            </div>
          )}
        </div>
      </div>

      <Toast text={toast} onDone={() => setToast("")} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <BottomNav active="story" onNav={gotoPage} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  BottomNav, ChoiceList, DialogueBox, ProgressDots, SoundSettings, Toast, Topbar,
} from "../components";
import { Particles, SceneClinic, SceneFinal, SceneRaid } from "../components/art";
import { CHARACTERS, LEVEL_ASSET_PLANS, STORY } from "../data";
import { buildAudioIndex } from "../data/dungeons/huatuo/audioIndex";
import type { Beat, Choice, GameState } from "../data/types";
import { dialogueAudioPath, playDialogueAudio, stopDialogueAudio } from "../lib/audio";
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

function flattenBeats(beats: Beat[], state: GameState): Beat[] {
  const stateMap = state as unknown as Record<string, unknown>;
  // boxCompartment 为 null 时视为 "missed"（未发现夹层的默认状态）
  if (stateMap.boxCompartment === null || stateMap.boxCompartment === undefined) {
    stateMap.boxCompartment = "missed";
  }
  return beats.flatMap(beat => {
    if ("ifKey" in beat) {
      return stateMap[beat.ifKey] === beat.ifVal
        ? flattenBeats(beat.beats, state)
        : [];
    }
    return [beat];
  });
}

export function StoryPage({ state, setState, gotoPage, gotoEnding }: StoryPageProps) {
  const ch = state.currentChapter || 1;
  const chKey = "ch" + ch;
  const chapter = STORY[chKey];
  const [beatIdx, setBeatIdx] = useState(() => {
    const saved = loadBeat(ch);
    return saved;
  });
  const [toast, setToast] = useState("");

  const rawBeats = chapter?.beats ?? [];
  const beats = useMemo(
    () => flattenBeats(rawBeats, state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawBeats, state.ch2, state.ch3, state.ch4, state.boxCompartment, state.medical_skill, state.classifyRetry]
  );

  // beats 变化后，确保 beatIdx 不越界
  useEffect(() => {
    if (beatIdx >= beats.length && beats.length > 0) {
      setBeatIdx(beats.length - 1);
    }
  }, [beats.length, beatIdx]);

  useEffect(() => {
    saveBeat(ch, beatIdx);
  }, [ch, beatIdx]);

  const beat = beats[beatIdx];
  // 配音稳定下标：与 TTS 生成脚本共用 buildAudioIndex，按原始 beat 树的全量 DFS 编号，
  // 不随 flattenBeats 的展开/剔除而漂移（修复小游戏后配音错位）。
  const audioIndexMap = useMemo(() => buildAudioIndex(rawBeats), [rawBeats]);
  const audioIdx = beat ? audioIndexMap.get(beat) : undefined;
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
      // 如果已经做出了最终选择，跳过信任页，直接前进到下一个 beat
      if (state.finalChoice) {
        setBeatIdx(beatIdx + 1);
        return true;
      }
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

  const onGameStoryClick = () => {
    if (!gameNode || !gameDone) return;
    next();
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
    if (!beat || isTransition || gameNode || audioIdx === undefined) {
      stopDialogueAudio();
      return;
    }
    playDialogueAudio(dialogueAudioPath(ch, audioIdx));
    return () => stopDialogueAudio();
  }, [beat, ch, audioIdx, isTransition, gameNode]);

  return (
    <div className="page" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ── 全屏场景背景 ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {sceneEl}
        <AiSceneImage chapter={ch} beatIdx={beatIdx} />
        <div className="grain" />
        <div className="vignette" />
        <Particles count={16} />
        {/* 上下压暗，保证顶部栏与底部对白可读 */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(5,8,11,0.82) 0%, rgba(5,8,11,0.3) 15%, rgba(5,8,11,0.04) 40%, rgba(5,8,11,0.5) 66%, rgba(5,8,11,0.95) 100%)",
        }} />
      </div>

      {/* ── 顶部覆盖：返回 / 标题 / 进度 ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3 }}>
        <Topbar
          title="第一卷 · 青囊残卷"
          onBack={() => gotoPage("chapters")}
          right={
            <>
              <SoundSettings />
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
            fontSize: 18,
            color: "var(--gold-pale)",
            letterSpacing: "0.22em",
            textIndent: "0.22em",
            textShadow: "0 0 14px rgba(0,0,0,0.9), 0 0 10px rgba(236,220,166,0.4)",
          }}>{chapter?.title}</div>
        </div>
      </div>

      {/* ── 底部覆盖：对白 / 选项 / 小游戏入口 + 导航 ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div className="content-wrap content-wrap--narrow no-scrollbar" style={{
          padding: "0 20px 14px",
          maxHeight: "62vh", overflowY: "auto",
        }}>
          {gameNode ? (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {gameDone ? (
                <>
                  <div
                    onClick={onGameStoryClick}
                    style={{
                      textAlign: "center", cursor: "pointer",
                      fontSize: 14, color: "rgba(228,224,208,0.82)",
                      lineHeight: 1.8, letterSpacing: "0.04em", fontStyle: "italic",
                      textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                    }}>{gameNode.nextBeatUnlocked}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-primary press" onClick={next} style={{ flex: 1 }}>继 续 剧 情</button>
                    <button className="btn-ghost press" onClick={enterGame} style={{ flex: "0 0 auto", fontSize: 12, opacity: 0.7 }}>
                      重 玩
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {gameNode.context && (
                    <div style={{
                      textAlign: "center", fontSize: 13, color: "rgba(228,224,208,0.6)",
                      lineHeight: 1.85, letterSpacing: "0.04em", fontStyle: "italic",
                      textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                    }}>{gameNode.context}</div>
                  )}
                  <button className="btn-primary press" disabled={gameLocked} onClick={enterGame} style={{ width: "100%", minHeight: 48 }}>
                    {gameNode.name}
                  </button>
                  {gameLocked && (
                    <div style={{ textAlign: "center", fontSize: 11, opacity: 0.55 }}>尚缺少前置道具。</div>
                  )}
                </>
              )}
            </div>
          ) : isTransition ? null : "choices" in beat ? (
            <div className="fade-in" style={{ padding: "6px 0" }}>
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
                textAlign: "center", marginTop: 8,
                fontSize: 10.5, color: "rgba(228,224,208,0.4)",
                letterSpacing: "0.22em",
              }}>· 轻 触 继 续 ·</div>
            </div>
          )}
        </div>
        <BottomNav active="story" onNav={gotoPage} />
      </div>

      <Toast text={toast} onDone={() => setToast("")} />
    </div>
  );
}

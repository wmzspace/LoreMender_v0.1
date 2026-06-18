import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChoiceList, DialogueBox, ProgressDots, SoundSettings, Toast,
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

const LINE_IMAGES: Record<string, Record<number, string>> = {
  ch1: {
    0: "/images/levels/1/chapters/ch1_beats/ch1_01_aji_wakes_headache.png",
    2: "/images/levels/1/chapters/ch1_beats/ch1_02_huatuo_calls_scattered_slips.png",
    4: "/images/levels/1/chapters/ch1_beats/ch1_03_aji_recognizes_qingnang.png",
    5: "/images/levels/1/chapters/ch1_beats/ch1_04_huatuo_lifetime_fragment.png",
    6: "/images/levels/1/chapters/ch1_beats/ch1_05_aji_vows_keep_from_cao.png",
    7: "/images/levels/1/chapters/ch1_beats/ch1_06_huatuo_guarding_book_not_way.png",
    8: "/images/levels/1/chapters/ch1_beats/ch1_07_aji_asks_what_to_do.png",
    9: "/images/levels/1/chapters/ch1_beats/ch1_08_huatuo_mission_three_paths.png",
    10: "/images/levels/1/chapters/ch1_beats/ch1_09_huatuo_pushes_slips.png",
    11: "/images/levels/1/chapters/ch1_beats/ch1_10_bamboo_sorting_three_groups.png",
    12: "/images/levels/1/chapters/ch1_beats/ch1_11_old_wooden_box_revealed.png",
    13: "/images/levels/1/chapters/ch1_beats/ch1_12_huatuo_warns_search_box.png",
    14: "/images/levels/1/chapters/ch1_beats/ch1_13_wooden_box_mechanism_key.png",
    15: "/images/levels/1/chapters/ch1_beats/ch1_14_box_compartment_qingnang_fragment.png",
    16: "/images/levels/1/chapters/ch1_beats/ch1_15_huatuo_final_why_save_people.png",
    17: "/images/levels/1/chapters/ch1_beats/ch1_16_chains_soldier_arrives.png",
    19: "/images/levels/1/chapters/ch1_beats/ch1_17_huatuo_warns_trust_hate.png",
    20: "/images/levels/1/chapters/ch1_beats/ch1_18_body_search_tension.png",
    21: "/images/levels/1/chapters/ch1_beats/ch1_18_body_search_tension.png",
    22: "/images/levels/1/chapters/ch1_beats/ch1_19_aji_understands_inheritance.png",
    23: "/images/levels/1/chapters/ch1_beats/ch1_20_dawn_xuchang_escort_market.png",
    24: "/images/levels/1/chapters/ch1_beats/ch1_21_half_song_aji_stops.png",
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

const GAME_BEAT_IMAGES: Record<string, Record<number, string>> = {
  ch1: {
    11: "/images/levels/1/chapters/ch1_beats/ch1_10_bamboo_sorting_three_groups.png",
    16: "/images/levels/1/chapters/ch1_beats/ch1_13_wooden_box_mechanism_key.png",
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
  return [
    ...Object.values(LINE_IMAGES[chKey] || {}),
    ...Object.values(GAME_BEAT_IMAGES[chKey] || {}),
  ];
}

function resolveImagePath(chapter: number, imageIdx: number, beatIdx: number, isGame: boolean): string | undefined {
  const chKey = "ch" + chapter;
  if (isGame) {
    const gameMap = GAME_BEAT_IMAGES[chKey] || {};
    if (gameMap[beatIdx]) return gameMap[beatIdx];
  }
  const map = LINE_IMAGES[chKey] || {};
  const keys = Object.keys(map).map(Number).sort((a, b) => b - a);
  const matched = keys.find(k => k <= imageIdx);
  const asset = LEVEL_ASSET_PLANS.find(level => level.chapter === chapter);
  return matched !== undefined ? map[matched] : asset?.imagePath;
}

function AiSceneImage({ chapter, imageIdx, beatIdx, isGame }: {
  chapter: number;
  imageIdx: number;
  beatIdx: number;
  isGame: boolean;
}) {
  const imagePath = resolveImagePath(chapter, imageIdx, beatIdx, isGame);
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
  const [autoplay, setAutoplay] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const autoTimer = useRef<number>(0);
  const clearAuto = () => {
    if (autoTimer.current) { window.clearTimeout(autoTimer.current); autoTimer.current = 0; }
  };

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
  const imageIdx = !gameNode && audioIdx !== undefined ? audioIdx : beatIdx;
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

  const speaker = beat && "speaker" in beat ? CHARACTERS[beat.speaker] : undefined;
  const speakerName = speaker?.name ?? null;
  const speakerPortrait = speaker?.portrait ?? null;
  const lineText = beat && "line" in beat ? beat.line : "";
  const isNarration = !!(beat && "narration" in beat && beat.narration);

  // 历史记录:从开篇到当前 beat 的全部对白/旁白。
  const history = useMemo(() => {
    const out: { name: string | null; line: string; narration: boolean }[] = [];
    for (let i = 0; i <= beatIdx && i < beats.length; i++) {
      const b = beats[i];
      if (b && "line" in b) {
        const narration = "narration" in b && !!b.narration;
        const name = !narration && "speaker" in b ? (CHARACTERS[b.speaker]?.name ?? null) : null;
        out.push({ name, line: b.line, narration });
      }
    }
    return out;
  }, [beats, beatIdx]);

  // 自动播放:需「打字机显示完毕」且「配音读完」后再推进。
  const [typingDone, setTypingDone] = useState(false);
  const [audioDone, setAudioDone] = useState(false);
  const handleTypingDone = () => setTypingDone(true);

  useEffect(() => clearAuto, []);

  // 配音:每个 beat 重置进度。有配音则等 onended,无配音视为「已读完」。
  useEffect(() => {
    setTypingDone(false);
    if (!beat || isTransition || gameNode || audioIdx === undefined) {
      stopDialogueAudio();
      setAudioDone(true);
      return;
    }
    setAudioDone(false);
    playDialogueAudio(dialogueAudioPath(ch, audioIdx), () => setAudioDone(true));
    return () => stopDialogueAudio();
  }, [beat, ch, audioIdx, isTransition, gameNode]);

  // 「打字机完成 + 配音读完」后延时推进;开关打开时若当前句已读完立即生效。
  useEffect(() => {
    clearAuto();
    if (!autoplay || logOpen) return;
    if (!beat || isTransition || gameNode || "choices" in beat) return;
    if (typingDone && audioDone) {
      autoTimer.current = window.setTimeout(() => { next(); }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, logOpen, typingDone, audioDone, beat, isTransition, gameNode]);

  return (
    <div className="page" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ── 全屏场景背景 ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {sceneEl}
        <AiSceneImage chapter={ch} imageIdx={imageIdx} beatIdx={beatIdx} isGame={!!gameNode} />
        <div className="grain" />
        <div className="vignette" />
        <Particles count={16} />
        {/* 上下压暗,保证顶部浮层与底部对白可读 */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(5,8,11,0.78) 0%, rgba(5,8,11,0.18) 14%, rgba(5,8,11,0.04) 38%, rgba(5,8,11,0.45) 64%, rgba(5,8,11,0.96) 100%)",
        }} />
      </div>

      {/* ── 顶部浮层:居中竖排标题 · 右(音量+菜单)。左上角收/展侧栏由全局按钮承担。 ── */}
      <div className="scene-overlay-top story-top">
        <div className="story-top-titles">
          <div className="en-small story-top-vol" style={{
            fontSize: 12, letterSpacing: "0.34em",
            color: "var(--gold-pale)", opacity: 0.82,
            textShadow: "0 0 12px rgba(0,0,0,0.9)",
          }}>第 一 卷 · 青 囊 残 卷</div>
          <ProgressDots total={5} current={ch} />
          <div className="title-han story-top-chapter" style={{
            fontSize: 20, color: "var(--gold-pale)",
            letterSpacing: "0.3em", textIndent: "0.3em",
            textShadow: "0 0 16px rgba(0,0,0,0.92), 0 0 12px rgba(236,220,166,0.38)",
          }}>{chapter?.title}</div>
        </div>

        <div className="story-top-actions">
          <SoundSettings />
          <button className="icon-btn press" onClick={() => gotoPage("map")} aria-label="副本进程">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 底部浮层:对白 / 选项 / 小游戏入口 ── */}
      <div className="story-bottom" style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "stretch",
        paddingBottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
      }}>
        <div className="story-stage" style={{
          width: "100%",
          padding: "0 24px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          {gameNode ? (
            <div className="galgame-dialogue story-action fade-in">
              {gameDone ? (
                <>
                  <div className="story-action-text" onClick={onGameStoryClick} style={{ cursor: "pointer" }}>
                    {gameNode.nextBeatUnlocked}
                  </div>
                  <div className="story-action-btns">
                    <button className="btn-primary press" onClick={next}>继 续 剧 情</button>
                    <button className="btn-ghost press" onClick={enterGame} style={{ minHeight: 44, fontSize: 13 }}>重 玩</button>
                  </div>
                </>
              ) : (
                <>
                  {gameNode.context && <div className="story-action-text">{gameNode.context}</div>}
                  <div className="story-action-btns">
                    <button className="btn-primary press" disabled={gameLocked} onClick={enterGame} style={{ minHeight: 48 }}>
                      {gameNode.name}
                    </button>
                  </div>
                  {gameLocked && (
                    <div style={{ textAlign: "center", fontSize: 11, opacity: 0.55, marginTop: 6 }}>尚缺少前置道具。</div>
                  )}
                </>
              )}
            </div>
          ) : isTransition ? null : "choices" in beat ? (
            <div className="fade-in story-choices">
              <ChoiceList choices={beat.choices} onChoose={handleChoice} />
            </div>
          ) : (
            <DialogueBox
              speaker={speakerName}
              portrait={speakerPortrait}
              text={lineText}
              isNarration={isNarration}
              canPrev={beatIdx > 0}
              onPrev={prev}
              onNext={next}
              autoOn={autoplay}
              onToggleAuto={() => setAutoplay(a => !a)}
              onOpenLog={() => setLogOpen(true)}
              onMenu={() => gotoPage("map")}
              onTypingDone={handleTypingDone}
            />
          )}
        </div>
      </div>

      {/* ── 历史记录浮层 ── */}
      {logOpen && (
        <>
          <div className="sheet-backdrop" onClick={() => setLogOpen(false)} />
          <div className="sheet">
            <div className="history-log">
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 14, paddingBottom: 10,
                borderBottom: "1px solid rgba(205,178,119,0.22)",
              }}>
                <span className="title-han" style={{ fontSize: 16, color: "var(--gold-pale)", letterSpacing: "0.2em" }}>历 史 记 录</span>
                <button className="icon-btn press" onClick={() => setLogOpen(false)} aria-label="关闭">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 2 L11 11 M11 2 L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {history.length === 0 ? (
                <div style={{ opacity: 0.5, fontSize: 13, textAlign: "center", padding: "20px 0" }}>暂无对白</div>
              ) : history.map((h, i) => (
                <div key={i} className="history-log-item">
                  {h.name && <div className="hl-name">{h.name}</div>}
                  <div className={"hl-line" + (h.narration ? " narration" : "")}>{h.line}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Toast text={toast} onDone={() => setToast("")} />
    </div>
  );
}

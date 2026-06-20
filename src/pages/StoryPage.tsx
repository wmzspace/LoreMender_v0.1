import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChoiceList, DialogueBox, ProgressDots, QuickMenu, SoundSettings, TitleSequence, titleCardContent, Toast,
  diffValues, type ValueDelta,
} from "../components";
import { Particles, SceneClinic, SceneFinal, SceneRaid } from "../components/art";
import { CHARACTERS, CLUES, LEVEL_ASSET_PLANS, STORY, ITEMS, parseGainedItemIds, parseGainedClueIds } from "../data";
import type { Clue, ItemDef } from "../data";
import { buildAudioIndex } from "../data/dungeons/huatuo/audioIndex";
import type { Beat, Choice, GameState } from "../data/types";
import { dialogueAudioPath, exploreAudioPath, playDialogueAudio, playSfx, stopDialogueAudio } from "../lib/audio";
import { loadBeat, saveBeat, saveState } from "../lib/storage";
import { matchIf } from "../lib/beats";
import type { PageKey } from "../lib/routes";

interface StoryPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
  gotoEnding: () => void;
  onValueDeltas?: (d: ValueDelta[]) => void;
}

const preloaded = new Set<string>();

function preloadImages(paths: string[]) {
  for (const p of paths) {
    if (preloaded.has(p)) continue;
    preloaded.add(p);
    const img = new Image();
    img.src = p;
  }
}

function collectImagePaths(beats: Beat[]): string[] {
  const out: string[] = [];
  const walk = (bs: Beat[]) => {
    for (const beat of bs) {
      if ("image" in beat && beat.image) out.push(beat.image);
      if ("game" in beat && beat.game.nextBeatUnlockedImage) out.push(beat.game.nextBeatUnlockedImage);
      if ("ifKey" in beat) walk(beat.beats);
    }
  };
  walk(beats);
  return out;
}

function resolveImagePath(beats: Beat[], beatIdx: number, chapterNum: number, overrideImage?: string): string | undefined {
  if (overrideImage) return overrideImage;
  for (let i = beatIdx; i >= 0; i--) {
    const beat = beats[i];
    if (beat && "image" in beat && beat.image) return beat.image;
  }
  const asset = LEVEL_ASSET_PLANS.find(level => level.chapter === chapterNum);
  return asset?.imagePath;
}

function AiSceneImage({ chapterNum, beats, beatIdx, overrideImage }: {
  chapterNum: number;
  beats: Beat[];
  beatIdx: number;
  overrideImage?: string;
}) {
  const imagePath = resolveImagePath(beats, beatIdx, chapterNum, overrideImage);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(imagePath);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    preloadImages(collectImagePaths(beats));
  }, [beats]);

  useEffect(() => {
    if (!imagePath || imagePath === currentSrc) return;
    setLoaded(false);
    setCurrentSrc(imagePath);
  }, [imagePath, currentSrc]);

  if (!currentSrc) return null;
  return (
    <img
      // 缓存命中时 img 的 load 事件可能在 onLoad 绑定前就已触发（load 不冒泡），
      // 用 ref 回调检查 complete 兜底，避免 loaded 卡在 false 导致图片始终透明。
      ref={(el) => { if (el?.complete && el.naturalWidth > 0) setLoaded(true); }}
      src={currentSrc}
      alt={`第${chapterNum}章剧情插图`}
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
      return matchIf(stateMap[beat.ifKey], beat.ifVal, beat.ifCmp)
        ? flattenBeats(beat.beats, state)
        : [];
    }
    return [beat];
  });
}

// 所有数值字段统一为「累加」：对白选择各只能选一次，与小游戏的 delta 贡献叠加在同一字段上。
const NUMERIC_FIELDS = new Set<string>([
  "medical_skill", "asked_heart", "huatuo_trust",
  "chenbo_trust", "wangji_trust", "xuanyin_trust",
  "record_tendency", "system_tendency", "spread_tendency", "burn_tendency",
  "searchPressure",
]);

function applyChoiceSet(state: GameState, set: Choice["set"]): GameState {
  const next = { ...state };
  const map = next as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(set ?? {})) {
    if (NUMERIC_FIELDS.has(key)) {
      const v = Number(map[key] || 0) + Number(value || 0);
      map[key] = key === "searchPressure" ? Math.max(0, v) : v; // 压力不为负
    } else {
      map[key] = value; // ch2/ch3/ch4 等字符串状态：直接赋值
    }
  }
  return next;
}

/** 章号中文数字（用于章首过场「第 N 章」）。 */
const CN_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export function StoryPage({ state, setState, gotoPage, gotoEnding, onValueDeltas }: StoryPageProps) {
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
  // 章首开场标题卡：进入新一章（beatIdx 0）时黑屏过场；从小游戏返回(beatIdx≠0)不重复。
  // 进入第一卷时先播「第一卷·青囊残卷」卷卡，再播「第N章·章名」章卡（队列依次播放）。
  const [titleQueue, setTitleQueue] = useState<{ eyebrow: string; title: string }[]>([]);
  const showTitleCard = titleQueue.length > 0;
  const announcedChRef = useRef<number | null>(null);
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

  // 章首过场：仅当处于该章开头(beatIdx 0)、且本章尚未播过标题卡时触发。
  // 从小游戏返回会重挂载本组件，但此时 beatIdx≠0，故不会重复播放。
  useEffect(() => {
    if (beatIdx === 0 && announcedChRef.current !== ch) {
      announcedChRef.current = ch;
      const cards: { eyebrow: string; title: string }[] = [];
      // 进入第一卷（=第一章入口）时，先播一张卷卡
      if (ch === 1) cards.push({ eyebrow: "第 一 卷", title: "青 囊 残 卷" });
      cards.push({ eyebrow: `第 ${CN_NUM[ch] ?? ch} 章`, title: chapter?.title ?? "" });
      setTitleQueue(cards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch, beatIdx]);

  const beat = beats[beatIdx];
  // 配音稳定下标：与 TTS 生成脚本共用 buildAudioIndex，按原始 beat 树的全量 DFS 编号，
  // 不随 flattenBeats 的展开/剔除而漂移（修复小游戏后配音错位）。
  const audioIndexMap = useMemo(() => buildAudioIndex(rawBeats), [rawBeats]);
  const audioIdx = beat ? audioIndexMap.get(beat) : undefined;
  const gameNode = beat && "game" in beat ? beat.game : null;
  const exploreScene = beat && "explore" in beat ? beat.explore : null;
  const gameDone = !!(gameNode && state.gameResults[gameNode.id]?.completed);
  const gameLocked = !!(gameNode?.requiredItem && !state.items.includes(gameNode.requiredItem));
  const gameSceneImage = gameDone ? gameNode?.nextBeatUnlockedImage : undefined;
  const isTransition = isTransitionBeat(beat);

  const runTransition = (b: Beat | undefined, atIdx: number): boolean => {
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
      // 如果已经做出了最终选择，跳过信任页，前进到「该 gotoTrust beat 的下一个 beat」。
      // 注意必须用转场 beat 自身的下标 atIdx，而不是当前 beatIdx——否则会停在 gotoTrust 上卡死。
      if (state.finalChoice) {
        setBeatIdx(atIdx + 1);
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
      const ns = applyChoiceSet(state, choice.set);
      // 计算并展示数值变化（《底特律》式右上角提示）
      const deltas = diffValues(
        state as unknown as Record<string, unknown>,
        ns as unknown as Record<string, unknown>,
        Date.now(),
      );
      if (deltas.length) onValueDeltas?.(deltas);
      setState(ns);
      saveState(ns);
    }
    // toast 与右上角数值卡片可同时显示（叙事提示与数值反馈并存）。
    if (choice.toast) setToast(choice.toast);
    // 选择后前进到下一个 beat
    goToIndex(beatIdx + 1);
  };

  const goToIndex = (idx: number) => {
    const clamped = Math.max(0, Math.min(beats.length - 1, idx));
    const target = beats[clamped];
    if (isTransitionBeat(target)) {
      runTransition(target, clamped);
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
    if (runTransition(beat, beatIdx)) return;
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

  // ── 可交互探索场景状态 ──
  const [exploreOpen, setExploreOpen] = useState<string | null>(null); // 当前展开的热点 id
  const [exploreSub, setExploreSub] = useState(0);                     // 该热点对白的下标
  const [exploreVisited, setExploreVisited] = useState<string[]>([]);  // 已看过的热点
  const [itemNotice, setItemNotice] = useState<string | null>(null);   // 杂项「获得」轻提示
  const [itemModal, setItemModal] = useState<ItemDef[] | null>(null);  // 获得物品详情弹窗
  const [clueModal, setClueModal] = useState<Clue[] | null>(null);     // 发现线索详情弹窗

  // 切换主 beat 时重置探索状态
  useEffect(() => { setExploreOpen(null); setExploreSub(0); setExploreVisited([]); }, [beatIdx]);

  const exHotspot = exploreScene?.hotspots.find(h => h.id === exploreOpen) ?? null;
  const exBeat = exHotspot?.beats[exploreSub];
  const exSpeaker = exBeat && "speaker" in exBeat ? CHARACTERS[exBeat.speaker] : undefined;
  const exIsNarration = !!(exBeat && "narration" in exBeat && exBeat.narration);
  const exText = exBeat && "line" in exBeat ? exBeat.line : "";
  const allExplored = !!exploreScene && exploreVisited.length >= exploreScene.hotspots.length;

  // 当前正在显示的台词（探索打开时取热点对白，否则取主线对白），用于「获得物品」检测
  const activeLine = exploreOpen
    ? exText
    : (!isTransition && !gameNode && beat && "line" in beat ? beat.line : "");

  const openHotspot = (id: string) => { setExploreOpen(id); setExploreSub(0); };
  const exploreNext = () => {
    if (!exHotspot) return;
    if (exploreSub < exHotspot.beats.length - 1) { setExploreSub(exploreSub + 1); return; }
    // 该热点对白看完:回到场景并标记已看
    setExploreOpen(null);
    setExploreSub(0);
    setExploreVisited(v => v.includes(exHotspot.id) ? v : [...v, exHotspot.id]);
  };
  const explorePrev = () => { if (exploreSub > 0) setExploreSub(exploreSub - 1); };

  useEffect(() => clearAuto, []);

  // 配音:每个 beat 重置进度。有配音则等 onended,无配音视为「已读完」。
  useEffect(() => {
    setTypingDone(false);
    // 章首标题卡显示期间不播配音；标题卡结束后本 effect 会因 showTitleCard 变化重跑并播放。
    if (showTitleCard) { stopDialogueAudio(); return; }
    if (!beat || isTransition || gameNode || audioIdx === undefined) {
      stopDialogueAudio();
      setAudioDone(true);
      return;
    }
    setAudioDone(false);
    playDialogueAudio(dialogueAudioPath(ch, audioIdx), () => setAudioDone(true));
    return () => stopDialogueAudio();
  }, [beat, ch, audioIdx, isTransition, gameNode, showTitleCard]);

  // 探索热点对白配音：打开热点 / 翻句时播放对应音频。
  useEffect(() => {
    if (!exploreScene || !exploreOpen) return;
    const hs = exploreScene.hotspots.find(h => h.id === exploreOpen);
    if (!hs || !hs.beats[exploreSub]) return;
    playDialogueAudio(exploreAudioPath(ch, exploreOpen, exploreSub));
    return () => stopDialogueAudio();
  }, [exploreScene, exploreOpen, exploreSub, ch]);

  // 获得物品 /发现线索：当前台词为「获得：xxx」或「线索：xxx」旁白时，播放音效并弹出对应弹窗。
  useEffect(() => {
    // —— 物品：「获得：xxx」→ 带图详情弹窗（未登记则顶部轻提示） ——
    const mi = activeLine.match(/^获得[:：]\s*([^。\n]+)/);
    if (mi) {
      playSfx("unlock");
      const newIds = parseGainedItemIds(activeLine).filter(id => !state.items.includes(id));
      if (newIds.length) {
        const ns: GameState = { ...state, items: [...state.items, ...newIds] };
        setState(ns);
        saveState(ns);
      }
      const defs = newIds.map(id => ITEMS[id]).filter((d): d is ItemDef => !!d);
      if (defs.length) {
        setItemModal(defs);
      } else {
        setItemNotice(mi[1].trim());
        const t = window.setTimeout(() => setItemNotice(null), 2800);
        return () => window.clearTimeout(t);
      }
      return;
    }
    // —— 线索：「线索：xxx」→ 线索详情弹窗 + 写入 searchedClues（进线索板·已得线索） ——
    const mc = activeLine.match(/^线索[:：]\s*([^。\n]+)/);
    if (mc) {
      playSfx("unlock");
      const had = state.searchedClues ?? [];
      const newIds = parseGainedClueIds(activeLine).filter(id => !had.includes(id));
      if (newIds.length) {
        const ns: GameState = { ...state, searchedClues: [...had, ...newIds] };
        setState(ns);
        saveState(ns);
      }
      const defs = newIds.map(id => CLUES.find(c => c.id === id)).filter((c): c is Clue => !!c);
      if (defs.length) {
        setClueModal(defs);
      } else {
        setItemNotice(mc[1].trim());
        const t = window.setTimeout(() => setItemNotice(null), 2800);
        return () => window.clearTimeout(t);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLine]);

  // 「打字机完成 + 配音读完」后延时推进;开关打开时若当前句已读完立即生效。
  useEffect(() => {
    clearAuto();
    if (!autoplay || logOpen) return;
    if (!beat || isTransition || gameNode || exploreScene || showTitleCard || "choices" in beat) return;
    if (typingDone && audioDone) {
      autoTimer.current = window.setTimeout(() => { next(); }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, logOpen, typingDone, audioDone, beat, isTransition, gameNode, showTitleCard]);

  return (
    <div className="page" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ── 章首开场过场（单层黑底，卷卡→章卡连播不闪） ── */}
      {showTitleCard && (
        <TitleSequence
          cards={titleQueue.map(c => titleCardContent(c.eyebrow, c.title))}
          onDone={() => setTitleQueue([])}
        />
      )}

      {/* ── 全屏场景背景 ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {sceneEl}
        <AiSceneImage chapterNum={ch} beats={beats} beatIdx={beatIdx} overrideImage={gameSceneImage} />
        {exploreScene?.image && (
          <img src={exploreScene.image} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          }} />
        )}
        {exHotspot?.image && (
          <img src={exHotspot.image} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          }} />
        )}
        <div className="grain" />
        <div className="vignette" />
        <Particles count={16} />
        {/* 上下压暗,保证顶部浮层与底部对白可读 */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(5,8,11,0.78) 0%, rgba(5,8,11,0.18) 14%, rgba(5,8,11,0.04) 38%, rgba(5,8,11,0.45) 64%, rgba(5,8,11,0.96) 100%)",
        }} />
      </div>

      {/* ── 探索热点层:点击场景中的人与物 ── */}
      {exploreScene && !exploreOpen && (
        <div className="explore-layer">
          {exploreScene.hotspots.map(h => {
            const done = exploreVisited.includes(h.id);
            return (
              <button
                key={h.id}
                data-sfx="nav"
                className={"explore-hotspot" + (done ? " is-done" : "")}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => openHotspot(h.id)}
                aria-label={h.label}
              >
                <span className="explore-dot" />
                <span className="explore-label">{done ? "✓ " : ""}{h.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 顶部浮层:居中竖排标题 · 右(音量+菜单)。左上角收/展侧栏由全局按钮承担。 ── */}
      <div className="scene-overlay-top story-top">
        <div className="story-top-titles">
          <div className="en-small story-top-vol" style={{
            fontSize: 13.5, letterSpacing: "0.32em",
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
          <QuickMenu onNav={gotoPage} />
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
          {exploreScene ? (
            exploreOpen ? (
              <DialogueBox
                speaker={exSpeaker?.name ?? null}
                portrait={exSpeaker?.portrait ?? null}
                text={exText}
                isNarration={exIsNarration}
                canPrev={exploreSub > 0}
                onPrev={explorePrev}
                onNext={exploreNext}
                autoOn={false}
                onToggleAuto={() => { }}
                onOpenLog={() => setLogOpen(true)}
                onMenu={() => gotoPage("map")}
                onTypingDone={() => { }}
              />
            ) : (
              <div className="galgame-dialogue story-action fade-in">
                <div className="story-action-text">
                  {exploreScene.hint}
                  <span style={{ marginLeft: 10, opacity: 0.7 }}>
                    已了解 {exploreVisited.length}/{exploreScene.hotspots.length}
                  </span>
                </div>
                {allExplored ? (
                  <div className="story-action-btns">
                    <button className="btn-primary press" onClick={next}>继 续 剧 情</button>
                  </div>
                ) : (
                  <div className="story-action-btns">
                    <button
                      className="btn-ghost press"
                      style={{ minHeight: 34, fontSize: 11, letterSpacing: "0.16em", opacity: 0.65 }}
                      onClick={() => {
                        // 开发者跳过：自动收集本场景所有热点的可登记物品与线索
                        const ids: string[] = [];
                        const clueIds: string[] = [];
                        exploreScene.hotspots.forEach(h => h.beats.forEach(b => {
                          if ("line" in b) {
                            parseGainedItemIds(b.line).forEach(id => { if (!ids.includes(id)) ids.push(id); });
                            parseGainedClueIds(b.line).forEach(id => { if (!clueIds.includes(id)) clueIds.push(id); });
                          }
                        }));
                        const newIds = ids.filter(id => !state.items.includes(id));
                        const hadClues = state.searchedClues ?? [];
                        const newClues = clueIds.filter(id => !hadClues.includes(id));
                        if (newIds.length || newClues.length) {
                          const ns: GameState = {
                            ...state,
                            items: [...state.items, ...newIds],
                            searchedClues: [...hadClues, ...newClues],
                          };
                          setState(ns);
                          saveState(ns);
                        }
                        setExploreVisited(exploreScene.hotspots.map(h => h.id));
                      }}
                    >开 发 者 跳 过</button>
                  </div>
                )}
              </div>
            )
          ) : gameNode ? (
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

      {/* 获得物品弹窗（带图 + 描述） */}
      {itemModal && (
        <div className="item-modal-backdrop" onClick={() => setItemModal(null)}>
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="item-modal-eyebrow">获 得 物 品</div>
            <div className="item-modal-list">
              {itemModal.map(it => (
                <div key={it.id} className="item-modal-entry">
                  <div className="item-modal-icon">
                    {it.image
                      ? <img src={it.image} alt={it.name} />
                      : <span className="cb-item-seal">物</span>}
                  </div>
                  <div className="item-modal-info">
                    <div className="item-modal-name">{it.name}</div>
                    {it.desc && <div className="item-modal-desc">{it.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary press item-modal-btn" onClick={() => setItemModal(null)}>收 下</button>
          </div>
        </div>
      )}

      {/* 发现线索弹窗（标题 + 详述，写入线索板） */}
      {clueModal && (
        <div className="item-modal-backdrop" onClick={() => setClueModal(null)}>
          <div className="item-modal item-modal--clue" onClick={(e) => e.stopPropagation()}>
            <div className="item-modal-eyebrow">发 现 线 索</div>
            <div className="item-modal-list">
              {clueModal.map(c => (
                <div key={c.id} className="item-modal-entry">
                  <div className="item-modal-icon"><span className="cb-item-seal">索</span></div>
                  <div className="item-modal-info">
                    <div className="item-modal-name">{c.title}</div>
                    <div className="item-modal-desc" style={{ whiteSpace: "pre-line" }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary press item-modal-btn" onClick={() => setClueModal(null)}>记 下</button>
          </div>
        </div>
      )}

      {/* 获得物品轻提示（杂项 / 线索） */}
      {itemNotice && (
        <div className="item-notice" key={itemNotice}>
          <span className="item-notice-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 5 L8 2 L13.5 5 L13.5 11 L8 14 L2.5 11 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M2.5 5 L8 8 L13.5 5 M8 8 L8 14" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7" />
            </svg>
          </span>
          <span className="item-notice-label">获 得</span>
          <span className="item-notice-name">{itemNotice}</span>
        </div>
      )}

      <Toast text={toast} onDone={() => setToast("")} />
    </div>
  );
}

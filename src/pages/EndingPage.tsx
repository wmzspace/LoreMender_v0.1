import { useEffect, useRef, useState } from "react";
import { GoldDivider, PaperPanel, SealTag } from "../components";
import {
  Particles, SceneEndingAsh, SceneEndingLiving, SceneEndingSealed,
} from "../components/art";
import {
  ENDINGS, ITEMS, ENDING_VIDEOS, ENDING_IMAGES, resolveEnding, getEndingBody, getEndingAudioId,
} from "../data";
import type { EndingId, GameState } from "../data/types";
import { defaultState, saveState, saveBeat } from "../lib/storage";
import { playSfx, playDialogueAudio, stopDialogueAudio, useAudioMuted } from "../lib/audio";
import { calcScore } from "../lib/score";
import { requestScrollToNextVolume } from "../lib/navHints";
import type { PageKey } from "../lib/routes";

/** Map ending ID to narrator voiceover for the ending body text */
const ENDING_NARRATION: Record<string, string> = {
  chenbo_true:        "/audio/levels/1/dialogue/endings/chenbo_true.mp3",
  chenbo_fallback:    "/audio/levels/1/dialogue/endings/chenbo_fallback.mp3",
  xuanyin_true:       "/audio/levels/1/dialogue/endings/xuanyin_true.mp3",
  xuanyin_fallback:   "/audio/levels/1/dialogue/endings/xuanyin_fallback.mp3",
  wangji_archive:     "/audio/levels/1/dialogue/endings/wangji_archive.mp3",
  wangji_trap:        "/audio/levels/1/dialogue/endings/wangji_trap.mp3",
  burn_ending:        "/audio/levels/1/dialogue/endings/burn_ending.mp3",
};

/** Overlay AI-generated ending scene illustration on top of SVG scene */
function EndingSceneImage({ endId }: { endId: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = ENDING_IMAGES[endId];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${ENDINGS[endId]?.name || ''} 结局插图`}
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

// 分项颜色：医术(jade)、信任(gold)、情理(暖棕)、最终抉择(随结局色)
const BREAKDOWN_COLORS = ["#2e7a62", "#8a6830", "#9e6e28"];

// ── 一卷总评分数面板 ───────────────────────────────────────────
/** 典故信物面板：依据是否获得「华佗手书残句」展示已收得 / 未收得两态。 */
function TokenPanel({ state }: { state: GameState }) {
  const token = ITEMS["huatuo_manuscript"];
  const obtained = state.items.includes("huatuo_manuscript");
  return (
    <div style={{ margin: "0 18px 18px" }}>
      <PaperPanel style={{ padding: "16px 20px 20px" }}>
        <GoldDivider label="典 故 信 物" labelStyle={{ fontSize: 16, opacity: 0.92 }} />
        {obtained ? (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 16px", borderRadius: 2,
              background: "rgba(44,102,87,0.16)", border: "1px solid rgba(44,102,87,0.45)",
            }}>
              <span style={{ color: "#2c6657", fontSize: 13, letterSpacing: "0.06em" }}>✦ 已收得</span>
            </div>
            <div className="title-han" style={{
              fontSize: 19, color: "var(--ink-deep)", marginTop: 14, letterSpacing: "0.08em",
            }}>{token.name}</div>
            <div style={{
              fontSize: 13, lineHeight: 1.95, color: "rgba(70,62,38,0.82)",
              marginTop: 10, letterSpacing: "0.03em",
            }}>{token.desc}</div>
            <div style={{
              fontFamily: "var(--font-han)", fontSize: 11.5, color: "rgba(44,102,87,0.78)",
              letterSpacing: "0.16em", marginTop: 14,
            }}>《拾遗残卷》被点亮一处空白</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 16px", borderRadius: 2,
              background: "rgba(110,98,70,0.12)", border: "1px solid rgba(110,98,70,0.32)",
            }}>
              <span style={{ color: "rgba(110,98,70,0.85)", fontSize: 13, letterSpacing: "0.06em" }}>○ 未收得</span>
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.95, color: "rgba(70,62,38,0.66)",
              marginTop: 14, letterSpacing: "0.03em",
            }}>这一程，你与华佗的羁绊还不足以让他把那句话亲手交予你。<br/>多一些理解与守护（与华佗的羁绊达「相契」以上），典故信物便会留在你手中。</div>
          </div>
        )}
      </PaperPanel>
    </div>
  );
}

function ScorePanel({ state }: { state: GameState }) {
  const { total, maxTotal, pct, grade, gradeColor, breakdown } = calcScore(state);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // r=30, center=(42,42), SVG 84×84
  const R = 30, CX = 42, CY = 42;
  const circ = Math.PI * 2 * R;

  return (
    <div ref={ref} style={{ margin: "0 18px 18px" }}>
      <PaperPanel style={{ padding: "16px 20px 22px" }}>
        <GoldDivider label="一 卷 总 评" labelStyle={{ fontSize: 17, opacity: 0.92 }} />

        {/* 顶部：圆环（SVG内嵌文字）+ 等级/总分 */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "14px 0 18px" }}>
          {/* 所有文字都在 SVG 内，不依赖 position:absolute */}
          <svg width="84" height="84" viewBox="0 0 84 84" style={{ display: "block", flexShrink: 0 }}>
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke="rgba(40,28,12,0.22)" strokeWidth="4.5" />
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={gradeColor} strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={`${visible ? circ * pct / 100 : 0} ${circ}`}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: "stroke-dasharray 1.3s cubic-bezier(.4,0,.2,1) 0.2s" }}
            />
            <text x={CX} y={CY + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="var(--font-han)" fontSize="22" fill={gradeColor}>
              {pct}
            </text>
            <text x={CX} y={CY + 17}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="sans-serif" fontSize="9" fill="rgba(40,28,12,0.55)">
              %
            </text>
          </svg>

          {/* 等级名 + 总分 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-han)",
              fontSize: 21, color: gradeColor,
              letterSpacing: "0.2em", textIndent: "0.2em",
              lineHeight: 1.2, marginBottom: 8,
            }}>{grade}</div>
            <div style={{ fontSize: 13, color: "var(--ink)", letterSpacing: "0.04em", fontWeight: 500 }}>
              {total}
              <span style={{ opacity: 0.52, fontSize: 10 }}> / {maxTotal} 分</span>
            </div>
            <div style={{
              fontSize: 9.5, color: "rgba(40,28,12,0.6)",
              letterSpacing: "0.22em", marginTop: 4,
            }}>玩法完成度</div>
          </div>
        </div>

        {/* 分项进度条 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {breakdown.map((item, i) => {
            const color = BREAKDOWN_COLORS[i] ?? gradeColor;
            const w = item.max > 0 ? Math.max(0, (item.score / item.max) * 100) : 0;
            return (
              <div key={item.label}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 11.5, color: "rgba(30,20,8,0.88)",
                    letterSpacing: "0.12em",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{
                      display: "inline-block", width: 6, height: 6,
                      borderRadius: "50%", background: color, flexShrink: 0,
                    }} />
                    {item.label}
                    {item.detail && (
                      <span style={{ opacity: 0.6, fontSize: 10 }}>（{item.detail}）</span>
                    )}
                  </span>
                  <span style={{ fontSize: 11.5, color, flexShrink: 0, letterSpacing: "0.04em", fontWeight: 500 }}>
                    {item.score}
                    <span style={{ opacity: 0.5, fontSize: 9 }}> / {item.max}</span>
                  </span>
                </div>
                <div style={{
                  height: 5, background: "rgba(40,28,12,0.15)",
                  borderRadius: 3, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${visible ? w : 0}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 3,
                    transition: `width 1s cubic-bezier(.4,0,.2,1) ${0.3 + i * 0.15}s`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <GoldDivider />
      </PaperPanel>
    </div>
  );
}

interface EndingPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

export function EndingPage({ state, setState, gotoPage }: EndingPageProps) {
  const endId: EndingId = state.lastEnding || resolveEnding(state);
  const e = ENDINGS[endId];

  const videoSrc = ENDING_VIDEOS[endId];
  // Capture first-unlock status before the state mutation in the effect below
  const isFirstUnlock = useRef(e ? !state.unlockedEndings.includes(endId) : false);
  const [showVideo, setShowVideo] = useState(!!videoSrc);
  const [fadingOut, setFadingOut] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const lastTapRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMuted = useAudioMuted();

  // dismissVideo must be defined BEFORE any ref that captures it (avoids const TDZ crash)
  const dismissVideo = () => {
    if (fadingOut) return;
    setFadingOut(true);
    stopDialogueAudio();
    if (isFirstUnlock.current) playSfx("unlock");
    setTimeout(() => setShowVideo(false), 600);
  };

  // Keep a ref to the latest dismissVideo so async callbacks always call the current closure
  const dismissVideoRef = useRef(dismissVideo);
  useEffect(() => { dismissVideoRef.current = dismissVideo; });

  // Track independent completion of video and narration
  const videoEndedRef = useRef(false);
  const narrationEndedRef = useRef(false);

  // Evaluated fresh on every call — avoids stale isMuted capture.
  // When narration is present: video loops, dismiss when narration ends.
  // When no narration (or muted): video plays once, dismiss when it ends.
  const checkAndDismissRef = useRef(() => {});
  useEffect(() => {
    checkAndDismissRef.current = () => {
      const hasNarration = !!ENDING_NARRATION[getEndingAudioId(state, endId)] && !isMuted;
      if (hasNarration ? narrationEndedRef.current : videoEndedRef.current) {
        dismissVideoRef.current();
      }
    };
  });

  // Reset completion flags each time the overlay opens
  useEffect(() => {
    if (showVideo) {
      videoEndedRef.current = false;
      narrationEndedRef.current = false;
    }
  }, [showVideo]);

  // Typewriter + narration
  const [displayedBody, setDisplayedBody] = useState("");
  useEffect(() => {
    if (!showVideo || !e?.body) return;
    setDisplayedBody("");
    let i = 0;
    const body = getEndingBody(state, endId);
    let intervalId: ReturnType<typeof setInterval>;
    const narrationSrc = ENDING_NARRATION[getEndingAudioId(state, endId)];
    const timeoutId = setTimeout(() => {
      if (narrationSrc) {
        playDialogueAudio(narrationSrc, () => {
          narrationEndedRef.current = true;
          checkAndDismissRef.current();
        }, 1.2);
      }
      intervalId = setInterval(() => {
        i++;
        setDisplayedBody(body.slice(0, i));
        if (i >= body.length) clearInterval(intervalId);
      }, 90);
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      stopDialogueAudio();
    };
  }, [showVideo, e?.body, state, endId]);

  // Tracks whether narration audio is active — read by onTimeUpdate and onEnded closures.
  // We use a ref (not state) so the video event handlers always see the current value
  // without needing to be recreated on every isMuted change.
  const hasNarrationRef = useRef(false);
  useEffect(() => { hasNarrationRef.current = !!ENDING_NARRATION[getEndingAudioId(state, endId)] && !isMuted; });

  // React doesn't reliably sync `muted` DOM property via JSX props — drive directly.
  // We intentionally do NOT set loop=true here: iOS Safari still fires the `ended` event
  // even on looping videos, which interrupts the audio session. Instead we seek back
  // to 0 in onTimeUpdate (see below) and replay in onEnded when narration is active.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, showVideo]);

  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) dismissVideo();
    lastTapRef.current = now;
  };

  useEffect(() => {
    if (e && !state.unlockedEndings.includes(endId)) {
      // sfx deferred to dismissVideo when video exists; fire immediately otherwise
      if (!videoSrc) playSfx("unlock");
      const ns: GameState = {
        ...state,
        unlockedEndings: [...state.unlockedEndings, endId],
        lastEnding: endId,
      };
      setState(ns);
      saveState(ns);
    } else if (state.lastEnding !== endId) {
      const ns: GameState = { ...state, lastEnding: endId };
      setState(ns);
      saveState(ns);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sceneFor = (id: EndingId) => {
    const glyph = ENDINGS[id]?.glyph;
    if (glyph === "wall") return <SceneEndingSealed/>;
    if (glyph === "fire") return <SceneEndingAsh/>;
    return <SceneEndingLiving/>;
  };

  const reset = () => {
    const ns: GameState = { ...defaultState(), unlockedEndings: state.unlockedEndings };
    setState(ns);
    saveState(ns);
    saveBeat(1, 0);
    gotoPage("cover");
  };
  const replay = () => {
    // 重新选择=从头再走一遍：除已解锁结局(图鉴)外，数值/小游戏成绩/物品/进度全部清零。
    const ns: GameState = { ...defaultState(), unlockedEndings: state.unlockedEndings };
    setState(ns);
    saveState(ns);
    saveBeat(1, 0);
    gotoPage("story");
  };

  if (!e) return null;
  return (
    <div className="page night-deep-bg" style={{overflowY:"auto"}}>
      {/* Cinematic opening video — fullscreen within .page, double-tap to skip */}
      {showVideo && videoSrc && (
        <div
          onClick={handleVideoTap}
          style={{
            position:"absolute", inset:0, zIndex:50,
            background:"var(--ink-deepest)",
            opacity: fadingOut ? 0 : 1,
            transition:"opacity 600ms ease",
          }}
        >
          {/* static ending image — visible immediately until video is ready */}
          {ENDING_IMAGES[endId] && (
            <img
              src={ENDING_IMAGES[endId]}
              alt=""
              style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover"}}
            />
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            preload="auto"
            muted={isMuted}
            onCanPlay={() => setVideoReady(true)}
            onTimeUpdate={() => {
              // Seek back before the natural end to prevent iOS Safari from firing `ended`
              // on a "looping" video — that event interrupts the audio session on iOS.
              if (!hasNarrationRef.current) return;
              const vid = videoRef.current;
              if (vid?.duration && vid.currentTime >= vid.duration - 0.5) {
                vid.currentTime = 0;
              }
            }}
            onEnded={() => {
              if (hasNarrationRef.current) {
                // Narration still playing — replay video manually (loop=true is unsafe on iOS).
                if (videoRef.current) videoRef.current.play().catch(() => {});
                return;
              }
              videoEndedRef.current = true;
              checkAndDismissRef.current();
            }}
            style={{
              position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
              opacity: videoReady ? 1 : 0,
              transition: "opacity 600ms ease",
            }}
          >
            <source src={videoSrc} type="video/mp4"/>
          </video>

          {/* top scrim + title + body (flows naturally below epitaph) */}
          <div style={{
            position:"absolute", top:0, left:0, right:0,
            padding:"calc(22px + env(safe-area-inset-top,0px)) 28px 48px",
            background:"linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 50%, transparent 100%)",
            pointerEvents:"none",
          }}>
            <div className="en-small fade-in" style={{
              fontSize:10, letterSpacing:"0.38em",
              color:"var(--gold-pale)", opacity:0.6,
              marginBottom:12,
            }}>THE LOREMENDER</div>
            <div className="title-han fade-in" style={{
              fontSize:38, color:"var(--gold-pale)",
              letterSpacing:"0.28em", textIndent:"0.28em",
              textShadow:"0 0 24px rgba(236,220,166,0.35), 0 2px 8px rgba(0,0,0,0.9)",
              animationDelay:"120ms",
            }}>{e.name}</div>
            <div className="fade-in" style={{
              marginTop:12,
              fontSize:16, fontStyle:"italic",
              color:"rgba(228,224,208,0.65)",
              letterSpacing:"0.06em",
              textShadow:"0 1px 6px rgba(0,0,0,0.8)",
              animationDelay:"240ms",
            }}>「{e.epitaph}」</div>
            {displayedBody && (
              <div style={{
                marginTop:24,
                fontSize:18, lineHeight:1.95,
                color:"rgba(228,224,208,0.88)",
                whiteSpace:"pre-line",
                letterSpacing:"0.05em",
                textAlign:"center",
                textShadow:"0 1px 6px rgba(0,0,0,0.9)",
              }}>{displayedBody}</div>
            )}
          </div>

          {/* bottom scrim + skip hint */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            padding:"64px 0 calc(48px + var(--safe-bottom))",
            background:"linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%)",
            display:"flex", justifyContent:"center", alignItems:"flex-end",
            pointerEvents:"none",
          }}>
            <div style={{
              fontFamily:"var(--font-han)",
              fontSize:18, color:"rgba(236,220,166,0.92)",
              letterSpacing:"0.25em", textIndent:"0.25em",
              textShadow:"0 0 16px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)",
              animation:"skipBlink 2.6s ease-in-out infinite",
            }}>双击以跳过动画</div>
          </div>
        </div>
      )}
      <div className="page-scroll" style={{padding: 0}}>
        <div style={{position:"relative"}}>

          {/* ── 场景插图区 ── */}
          <div style={{position:"relative", height: "clamp(300px, 50vh, 520px)"}}>
            {sceneFor(endId)}
            {ENDING_IMAGES[endId] && <EndingSceneImage endId={endId} />}
            <div className="grain"/>
            <div className="vignette"/>
            <Particles count={18}/>
            <div className="en-small fade-in" style={{
              position:"absolute", top: 14, left: 18, zIndex: 2,
              fontSize: 9.5, letterSpacing:"0.38em",
              color:"var(--gold-pale)", opacity: 0.5,
            }}>THE LOREMENDER</div>
            {/* 向下渐变 */}
            <div style={{
              position:"absolute", left:0, right:0, bottom: 0, height: 110,
              background:"linear-gradient(180deg, transparent, rgba(5,8,10,0.99))",
              pointerEvents:"none",
            }}/>
          </div>

          {/* ── 印章 + 标题区（浮在图上方） ── */}
          <div className="ink-in" style={{
            textAlign:"center", padding:"0 24px",
            marginTop: -36, position:"relative", zIndex: 2,
          }}>
            <div style={{
              display:"inline-flex", flexDirection:"column", alignItems:"center", gap: 12,
            }}>
              {/* 印章 + 光晕 */}
              <div style={{position:"relative"}}>
                <div style={{
                  position:"absolute", inset: -20, borderRadius:"50%",
                  background: e.rankColor, opacity: 0.42, filter:"blur(24px)",
                  animation: "glowPulse 3.5s ease-in-out infinite",
                }}/>
                <div style={{ position:"relative", animation: "sealStamp 700ms ease-out both" }}>
                  <SealTag size="lg" style={{
                    background: e.rankColor,
                    borderRadius: "50%",
                    width: 90, height: 90,
                  }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--font-han)", fontSize: 10, opacity: 0.75, letterSpacing:"0.18em" }}>结 局</div>
                      <div style={{ fontFamily:"var(--font-han)", fontSize: 12, opacity: 0.92, marginTop: 3, letterSpacing:"0.1em" }}>{e.rank}</div>
                    </div>
                  </SealTag>
                </div>
              </div>

              {/* 结局名 */}
              <div className="title-han" style={{
                fontSize: 28, color:"var(--gold-pale)",
                letterSpacing:"0.32em", textIndent:"0.32em",
                textShadow: "0 0 22px rgba(236,220,166,0.38), 0 2px 8px rgba(0,0,0,0.7)",
              }}>{e.name}</div>

              {/* 墓志铭 */}
              <div style={{
                fontSize: 13, color:"rgba(228,224,208,0.62)",
                fontStyle:"italic", letterSpacing:"0.1em",
                maxWidth: 260, lineHeight: 1.7,
                marginTop: -4,
              }}>「{e.epitaph}」</div>
            </div>
          </div>

          {/* ── 余音正文 ── */}
          <div className="content-wrap content-wrap--narrow">
            <div className="fade-up" style={{ margin: "26px 18px 0", animationDelay: "300ms" }}>
              <PaperPanel style={{padding:"18px 22px 22px"}}>
                <GoldDivider label="余 音"/>
                <div style={{
                  fontSize: 14, lineHeight: 2.05,
                  color:"var(--ink-deep)",
                  whiteSpace: "pre-line",
                  letterSpacing: "0.05em",
                  textAlign: "center",
                }}>{getEndingBody(state, endId)}</div>
                <GoldDivider/>
                <div style={{
                  textAlign:"center",
                  fontFamily:"var(--font-han)",
                  fontSize: 11, color:"rgba(70,62,38,0.6)",
                  letterSpacing:"0.42em", textIndent:"0.42em",
                  marginTop: 4,
                }}>· 全 章 终 ·</div>
              </PaperPanel>
            </div>
          </div>

          {/* ── 一卷总评 ── */}
          <div className="content-wrap content-wrap--narrow">
            <ScorePanel state={state} />
          </div>

          {/* ── 典故信物（与华佗羁绊≥3 时点亮《拾遗残卷》） ── */}
          <div className="content-wrap content-wrap--narrow">
            <TokenPanel state={state} />
          </div>

          {/* ── 操作按钮区 ── */}
          <div style={{ padding: "0 20px calc(32px + var(--safe-bottom))" }}>
            <div style={{
              textAlign:"center", fontSize: 10.5,
              color:"rgba(228,224,208,0.28)", letterSpacing:"0.3em",
              marginBottom: 14,
            }}>· · ·</div>
            <div className="ending-actions">
              <button className="btn-primary press" onClick={() => gotoPage("gallery")}
                style={{ width:"100%" }}>
                查 看 结 局 图 鉴
              </button>
              <button className="btn-ghost press" onClick={() => { requestScrollToNextVolume(); gotoPage("chapters"); }}>
                下 一 章
              </button>
              <button className="btn-ghost press" onClick={replay}>重 新 选 择</button>
              <button className="btn-ghost press" onClick={reset}>青 史 空 间</button>
            </div>
            <div style={{
              textAlign:"center", fontSize: 10,
              color:"rgba(228,224,208,0.22)", letterSpacing:"0.22em",
              marginTop: 16,
            }}>典故修补者 · 第一卷</div>
          </div>
        </div>
      </div>
    </div>
  );
}

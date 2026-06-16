import { useEffect, useRef, useState } from "react";
import { GoldDivider, PaperPanel, SealTag } from "../components";
import {
  Particles, SceneEndingAsh, SceneEndingLiving, SceneEndingSealed,
} from "../components/art";
import { ENDINGS, resolveEnding } from "../data";
import type { EndingId, GameState } from "../data/types";
import { defaultState, saveState } from "../lib/storage";
import { playSfx, useAudioMuted } from "../lib/audio";
import type { PageKey } from "../lib/routes";

/** Map ending ID to its cinematic opening video */
const ENDING_VIDEOS: Record<string, string> = {
  chenbo_true:      "/videos/levels/1/ending_chenbo_A_humble_village_doctor_s_hand.mp4",
  wangji_trap:      "/videos/levels/1/ending_wangji_Lacquered_chest_closes_over_scroll_202606161241.mp4",
  xuanyin_fallback: "/videos/levels/1/ending_xuanyin.mp4",
  burn_ending:      "/videos/levels/1/ending_burn.mp4",
};

/** Map ending ID to its dedicated scene illustration */
const ENDING_IMAGES: Record<string, string> = {
  chenbo_true: "/images/levels/1/chapters/endings/ending_chenbo.webp",
  xuanyin_fallback: "/images/levels/1/chapters/endings/ending_xuanyin.webp",
  wangji_trap: "/images/levels/1/chapters/endings/ending_wangji.webp",
  burn_ending: "/images/levels/1/chapters/endings/ending_burn.webp",
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

  // Typewriter effect for body text during video
  const [displayedBody, setDisplayedBody] = useState("");
  useEffect(() => {
    if (!showVideo || !e?.body) return;
    setDisplayedBody("");
    let i = 0;
    const body = e.body;
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setDisplayedBody(body.slice(0, i));
        if (i >= body.length) clearInterval(intervalId);
      }, 90);
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [showVideo, e?.body]);

  // React doesn't reliably sync the `muted` DOM property via JSX props — drive it directly
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted, showVideo]);

  const dismissVideo = () => {
    if (fadingOut) return;
    setFadingOut(true);
    if (isFirstUnlock.current) playSfx("unlock");
    setTimeout(() => setShowVideo(false), 600);
  };

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
    gotoPage("cover");
  };
  const replay = () => {
    const ns: GameState = {
      ...state,
      firstImpression: null, trust_huatuo: null,
      found_clue: null, suspect: null,
      cao_suspicion: null, caoCunning: null,
      finalChoice: null,
      searchedClues: [],
      trustedPerson: null, currentChapter: 1, lastEnding: null,
      firstChoice: null, ch2: null, finalDecision: null,
    };
    setState(ns);
    saveState(ns);
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
            muted={isMuted}
            onCanPlay={() => setVideoReady(true)}
            onEnded={dismissVideo}
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
              fontSize:28, color:"var(--gold-pale)",
              letterSpacing:"0.28em", textIndent:"0.28em",
              textShadow:"0 0 24px rgba(236,220,166,0.35), 0 2px 8px rgba(0,0,0,0.9)",
              animationDelay:"120ms",
            }}>{e.name}</div>
            <div className="fade-in" style={{
              marginTop:10,
              fontSize:13, fontStyle:"italic",
              color:"rgba(228,224,208,0.65)",
              letterSpacing:"0.06em",
              textShadow:"0 1px 6px rgba(0,0,0,0.8)",
              animationDelay:"240ms",
            }}>「{e.epitaph}」</div>
            {displayedBody && (
              <div style={{
                marginTop:22,
                fontSize:14, lineHeight:2,
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
              fontFamily:"ZCOOL XiaoWei, serif",
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
          <div style={{position:"relative", height: 280}}>
            {sceneFor(endId)}
            {/* AI-generated ending illustration overlay */}
            {ENDING_IMAGES[endId] && <EndingSceneImage endId={endId} />}
            <div className="grain"/>
            <div className="vignette"/>
            <Particles count={16}/>
            <div className="en-small fade-in" style={{
              position:"absolute", top: 14, left: 18, zIndex: 2,
              fontSize: 10, letterSpacing:"0.34em",
              color:"var(--gold-pale)", opacity: 0.6,
            }}>THE LOREMENDER</div>
            <div style={{
              position:"absolute", left:0, right:0, bottom: 0, height: 80,
              background:"linear-gradient(180deg, transparent, rgba(7,11,14,0.98))",
              pointerEvents:"none",
            }}/>
          </div>

          <div className="ink-in" style={{
            textAlign:"center", padding:"0 24px",
            marginTop: -22, position:"relative", zIndex: 2,
          }}>
            <div style={{
              display:"inline-flex", flexDirection:"column", alignItems:"center", gap: 10,
            }}>
              <div style={{position:"relative"}}>
                <div style={{
                  position:"absolute", inset: -16, borderRadius:"50%",
                  background: e.rankColor, opacity: 0.5, filter:"blur(20px)",
                  animation: "glowPulse 3s ease-in-out infinite",
                }}/>
                <div style={{
                  position:"relative", animation: "sealStamp 700ms ease-out both",
                }}>
                  <SealTag size="lg" style={{
                    background: e.rankColor,
                    borderRadius: 4,
                    width: 84, height: 84, fontSize: 13,
                  }}>
                    <div style={{lineHeight: 1.15, letterSpacing:"0.12em", textIndent:"0.12em"}}>
                      <div style={{fontSize: 11, opacity: 0.85}}>结 局</div>
                      <div style={{fontSize: 11, opacity: 0.85, marginTop: 2}}>{e.rank}</div>
                    </div>
                  </SealTag>
                </div>
              </div>
              <div className="title-han" style={{
                fontSize: 26, color:"var(--gold-pale)",
                letterSpacing:"0.3em", textIndent:"0.3em",
                marginTop: 8,
                textShadow: "0 0 20px rgba(236,220,166,0.4)",
              }}>{e.name}</div>
              <div style={{
                fontSize: 12.5, color:"rgba(228,224,208,0.7)",
                fontStyle:"italic", letterSpacing:"0.08em",
                marginTop: -2,
              }}>「{e.epitaph}」</div>
            </div>
          </div>

          <div className="fade-up" style={{
            margin: "24px 18px 18px",
            animationDelay: "300ms",
          }}>
            <PaperPanel style={{padding:"18px 20px 22px"}}>
              <GoldDivider label="余 音"/>
              <div style={{
                fontSize: 14, lineHeight: 2,
                color:"var(--ink-deep)",
                whiteSpace: "pre-line",
                letterSpacing: "0.04em",
                textAlign:"center",
              }}>{e.body}</div>
              <GoldDivider/>
              <div style={{
                textAlign:"center",
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 11, color:"rgba(70,62,38,0.65)",
                letterSpacing:"0.4em", textIndent:"0.4em",
                marginTop: 4,
              }}>· 全 章 终 ·</div>
            </PaperPanel>
          </div>

          <div style={{
            display:"flex", flexDirection:"column", gap: 10,
            padding: "0 20px calc(28px + var(--safe-bottom))",
          }}>
            <button className="btn-primary press" onClick={() => gotoPage("gallery")}>
              查 看 结 局 图 鉴
            </button>
            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
              <button className="btn-ghost press" onClick={replay}>重 新 选 择</button>
              <button className="btn-ghost press" onClick={reset}>青 史 空 间</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

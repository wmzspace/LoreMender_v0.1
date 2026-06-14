import { useEffect } from "react";
import { GoldDivider, PaperPanel, SealTag } from "../components";
import {
  Particles, SceneEndingAsh, SceneEndingLiving, SceneEndingSealed,
} from "../components/art";
import { ENDINGS, resolveEnding } from "../data";
import type { EndingId, GameState } from "../data/types";
import { defaultState, saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface EndingPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

export function EndingPage({ state, setState, gotoPage }: EndingPageProps) {
  const endId: EndingId = state.lastEnding || resolveEnding(state);
  const e = ENDINGS[endId];

  useEffect(() => {
    if (e && !state.unlockedEndings.includes(endId)) {
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
    if (id === "ash" || id === "burn_ending") return <SceneEndingAsh/>;
    if (id === "sealed" || id === "wangji_trap" || id === "xuanyin_fallback") return <SceneEndingSealed/>;
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
      <div className="page-scroll" style={{padding: 0}}>
        <div style={{position:"relative"}}>
          <div style={{position:"relative", height: 280}}>
            {sceneFor(endId)}
            <div className="grain"/>
            <div className="vignette"/>
            <Particles count={16}/>
            <div style={{
              position:"absolute", left:0, right:0, bottom: 0, height: 80,
              background:"linear-gradient(180deg, transparent, rgba(10,6,4,0.98))",
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
              <div style={{
                animation: "sealStamp 700ms ease-out both",
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
              <div className="title-han" style={{
                fontSize: 26, color:"var(--gold-pale)",
                letterSpacing:"0.3em", textIndent:"0.3em",
                marginTop: 8,
                textShadow: "0 0 20px rgba(231,199,115,0.4)",
              }}>{e.name}</div>
              <div style={{
                fontSize: 12.5, color:"rgba(231,217,179,0.7)",
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
                fontSize: 11, color:"rgba(78,58,20,0.65)",
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

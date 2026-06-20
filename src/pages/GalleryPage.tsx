import { useState } from "react";
import { BottomNav, SealTag, PageShell } from "../components";
import {
  SceneEndingAsh, SceneEndingLiving, SceneEndingSealed,
} from "../components/art";
import { ENDINGS } from "../data";
import type { EndingId, GameState } from "../data/types";
import { saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

/** Map ending ID to its dedicated AI scene illustration */
const ENDING_IMAGES: Record<string, string> = {
  chenbo_true: "/images/levels/1/chapters/endings/ending_chenbo.webp",
  chenbo_fallback: "/images/levels/1/chapters/endings/ending_chenbo_caomu.webp",
  xuanyin_true: "/images/levels/1/chapters/endings/ending_xuanyin.webp",
  xuanyin_fallback: "/images/levels/1/chapters/endings/ending_xuanyin.webp",
  wangji_archive: "/images/levels/1/chapters/endings/ending_wangji.webp", // TODO 占位：待生成 ending_wangji_archive.webp
  wangji_trap: "/images/levels/1/chapters/endings/ending_wangji.webp",
  burn_ending: "/images/levels/1/chapters/endings/ending_burn.webp",
};

function sceneForEnding(id: string) {
  const glyph = ENDINGS[id]?.glyph;
  if (glyph === "wall") return <SceneEndingSealed/>;
  if (glyph === "fire") return <SceneEndingAsh/>;
  return <SceneEndingLiving/>;
}

/** AI ending scene image overlay — loads on top of SVG fallback */
function EndingCardImage({ endId }: { endId: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = ENDING_IMAGES[endId];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={ENDINGS[endId]?.name || ''}
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

interface GalleryPageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

export function GalleryPage({ state, setState, gotoPage }: GalleryPageProps) {
  const unlocked = state.unlockedEndings || [];

  const enterEnding = (endId: EndingId) => {
    const ns: GameState = { ...state, lastEnding: endId };
    setState(ns);
    saveState(ns);
    gotoPage("ending");
  };

  // 【开发者外挂】一键解锁全部结局图鉴
  const allUnlocked = unlocked.length >= Object.keys(ENDINGS).length;
  const unlockAll = () => {
    const ns: GameState = { ...state, unlockedEndings: Object.keys(ENDINGS) as EndingId[] };
    setState(ns);
    saveState(ns);
  };
  return (
    <PageShell
      bg="night-deep-bg"
      eyebrow="ENDINGS · CODEX"
      title="结 局 图 鉴"
      subtitle={<>已解锁 <span style={{color:"var(--gold-pale)"}}>{unlocked.length}</span> / {Object.keys(ENDINGS).length}</>}
      onBack={() => gotoPage("story")}
      footer={<BottomNav active="gallery" onNav={gotoPage}/>}
    >
        <div className="grid-2">
        {Object.values(ENDINGS).map((e, i) => {
          const has = unlocked.includes(e.id);
          return (
            <div key={e.id} className="fade-up"
              style={{
                animationDelay: `${i*90}ms`,
              }}>
              <div
                onClick={has ? () => enterEnding(e.id) : undefined}
                className={has ? "press" : undefined}
                style={{
                  position:"relative", overflow:"hidden",
                  border: "1px solid " + (has ? "rgba(205,178,119,0.6)" : "rgba(70,62,38,0.5)"),
                  borderRadius: 2,
                  boxShadow: has ? "0 0 0 1px rgba(236,220,166,0.12), 0 8px 24px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.5)",
                  cursor: has ? "pointer" : "default",
                }}>
                <div style={{position:"relative", height: "clamp(130px, 22vh, 200px)"}}>
                  {has ? (
                    <>
                      {sceneForEnding(e.id)}
                      <EndingCardImage endId={e.id} />
                    </>
                  ) : (
                    <div style={{
                      width:"100%", height:"100%",
                      background:"radial-gradient(circle at 50% 50%, rgba(26,38,42,0.6), rgba(5,8,11,0.95))",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <div className="title-han" style={{
                        fontSize: 64, color:"rgba(205,178,119,0.18)",
                        letterSpacing:"0.4em",
                      }}>？ ？</div>
                    </div>
                  )}
                  <div className="grain"/>
                  <div className="vignette"/>
                  {has && (
                    <>
                      <div style={{
                        position:"absolute", top: 10, right: 10,
                        animation: "sealStamp 600ms ease both",
                      }}>
                        <SealTag size="sm" style={{
                          background: e.rankColor,
                          transform:"rotate(-6deg)",
                          width: 38, height: 38, fontSize: 10,
                        }}>{e.rank.slice(0,2)}</SealTag>
                      </div>
                      {/* play hint */}
                      <div style={{
                        position:"absolute", bottom: 10, left: 12,
                        fontFamily:"var(--font-han)",
                        fontSize: 11, color:"rgba(205,178,119,0.65)",
                        letterSpacing:"0.18em", textIndent:"0.18em",
                        zIndex: 2,
                      }}>▶ 回 放</div>
                    </>
                  )}
                </div>
                <div style={{
                  padding: "12px 14px",
                  background:"linear-gradient(180deg, rgba(9,14,17,0.95), rgba(5,8,11,0.95))",
                  borderTop:"1px solid " + (has ? "rgba(205,178,119,0.3)" : "rgba(70,62,38,0.5)"),
                }}>
                  <div className="title-han" style={{
                    fontSize: 16,
                    color: has ? "var(--gold-pale)" : "rgba(140,107,41,0.6)",
                    letterSpacing:"0.2em", textIndent:"0.2em",
                  }}>{has ? e.name : "？ ？ ？"}</div>
                  <div style={{
                    fontSize: 12, marginTop: 6,
                    opacity: has ? 0.8 : 0.45,
                    fontStyle:"italic",
                    color:"rgba(228,224,208,0.85)",
                    letterSpacing:"0.04em",
                  }}>
                    {has ? `「${e.epitaph}」` : "尚未解锁此结局。"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        <div style={{
          textAlign:"center", padding: "12px 0 16px",
          fontFamily:"var(--font-han)",
          fontSize: 11, opacity: 0.45,
          letterSpacing:"0.4em",
        }}>· 收 卷 ·</div>

        {/* 【开发者外挂】一键解锁全部结局 */}
        <div style={{ textAlign:"center", padding:"0 0 24px" }}>
          <button
            className="press"
            data-sfx="unlock"
            disabled={allUnlocked}
            onClick={unlockAll}
            style={{
              fontFamily:"var(--font-han)",
              fontSize: 12, letterSpacing:"0.2em", textIndent:"0.2em",
              padding:"8px 18px", borderRadius: 2, cursor: allUnlocked ? "default" : "pointer",
              color: allUnlocked ? "rgba(140,107,41,0.5)" : "rgba(205,178,119,0.9)",
              background:"rgba(9,14,17,0.6)",
              border:"1px dashed " + (allUnlocked ? "rgba(70,62,38,0.5)" : "rgba(205,178,119,0.5)"),
              opacity: allUnlocked ? 0.5 : 1,
            }}>
            {allUnlocked ? "已 解 锁 全 部" : "解 锁 全 部"}
            <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.7 }}>【开发者外挂】</span>
          </button>
        </div>
    </PageShell>
  );
}

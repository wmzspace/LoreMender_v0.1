import { BottomNav, SealTag, Topbar, PageHeader } from "../components";
import {
  SceneEndingAsh, SceneEndingLiving, SceneEndingSealed,
} from "../components/art";
import { ENDINGS } from "../data";
import type { GameState } from "../data/types";
import type { PageKey } from "../lib/routes";

function sceneForEnding(id: string) {
  const glyph = ENDINGS[id]?.glyph;
  if (glyph === "wall") return <SceneEndingSealed/>;
  if (glyph === "fire") return <SceneEndingAsh/>;
  return <SceneEndingLiving/>;
}

interface GalleryPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

export function GalleryPage({ state, gotoPage }: GalleryPageProps) {
  const unlocked = state.unlockedEndings || [];
  return (
    <div className="page night-deep-bg">
      <Topbar title="结 局 图 鉴" onBack={() => gotoPage("story")}/>

      <div className="page-scroll" style={{top: 56, bottom: 64, padding: "0 16px"}}>
        <PageHeader
          eyebrow="ENDINGS · CODEX"
          intro={<>已解锁 <span style={{color:"var(--gold-pale)"}}>{unlocked.length}</span> / {Object.keys(ENDINGS).length}</>}
        />

        {Object.values(ENDINGS).map((e, i) => {
          const has = unlocked.includes(e.id);
          return (
            <div key={e.id} className="fade-up"
              style={{
                marginBottom: 14,
                animationDelay: `${i*90}ms`,
              }}>
              <div style={{
                position:"relative", overflow:"hidden",
                border: "1px solid " + (has ? "rgba(205,178,119,0.6)" : "rgba(70,62,38,0.5)"),
                borderRadius: 2,
                boxShadow: has ? "0 0 0 1px rgba(236,220,166,0.12), 0 8px 24px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.5)",
              }}>
                <div style={{position:"relative", height: 130}}>
                  {has ? (
                    sceneForEnding(e.id)
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

        <div style={{
          textAlign:"center", padding: "12px 0 20px",
          fontFamily:"ZCOOL XiaoWei, serif",
          fontSize: 11, opacity: 0.45,
          letterSpacing:"0.4em",
        }}>· 收 卷 ·</div>
      </div>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="gallery" onNav={gotoPage}/>
      </div>
    </div>
  );
}

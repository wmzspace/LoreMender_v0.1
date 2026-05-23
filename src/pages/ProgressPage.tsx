import { BottomNav, SealTag } from "../components";
import { CHAPTERS } from "../data";
import type { GameState } from "../data/types";
import type { PageKey } from "../lib/routes";

interface ProgressPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

export function ProgressPage({ state, gotoPage }: ProgressPageProps) {
  const cur = state.currentChapter || 1;
  return (
    <div className="page night-deep-bg">
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("story")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">副 本 进 程</div>
        <div style={{width:38}}/>
      </div>

      <div className="page-scroll" style={{top: 56, bottom: 64, padding: "8px 16px 28px"}}>
        <div className="fade-in" style={{textAlign:"center", marginBottom: 14}}>
          <div className="en-small" style={{fontSize: 10, opacity: 0.6, color:"var(--gold-pale)"}}>
            CHAPTER · MAP
          </div>
          <div style={{
            fontSize: 12.5, opacity: 0.75, marginTop: 4,
            color:"rgba(231,217,179,0.85)",
            letterSpacing: "0.05em",
          }}>建安二十五年 · 许都 · 一夜</div>
        </div>

        <div style={{position:"relative", paddingLeft: 36}}>
          <div style={{
            position:"absolute", left: 17, top: 14, bottom: 14,
            width: 2,
            background: "linear-gradient(180deg, transparent, var(--gold-pale) 8%, var(--gold-pale) 92%, transparent)",
            opacity: 0.7,
            boxShadow: "0 0 8px var(--gold-pale)",
          }}/>

          {CHAPTERS.map((c, i) => {
            const isCur = c.num === cur;
            const done = c.num < cur;
            const locked = c.num > cur;
            return (
              <div key={c.id} className="fade-up"
                style={{
                  position:"relative", marginBottom: 14,
                  animationDelay:`${i*80}ms`,
                }}>
                <div style={{
                  position:"absolute", left: -26, top: 12,
                  width: 18, height: 18, borderRadius:"50%",
                  background: isCur ? "var(--gold-pale)" : (done ? "var(--gold-deep)" : "rgba(30,22,14,0.9)"),
                  border: "2px solid " + (locked ? "rgba(78,58,20,0.5)" : "var(--gold-pale)"),
                  boxShadow: isCur ? "0 0 14px var(--gold-pale)" : "none",
                }}/>
                <div style={{
                  background: isCur
                    ? "linear-gradient(180deg, rgba(60,45,25,0.95), rgba(20,14,8,0.95))"
                    : (done
                      ? "linear-gradient(180deg, rgba(30,22,14,0.85), rgba(15,10,6,0.85))"
                      : "linear-gradient(180deg, rgba(20,14,8,0.5), rgba(10,6,4,0.5))"),
                  border:"1px solid " + (isCur ? "var(--gold-pale)" : (done ? "rgba(201,161,74,0.4)" : "rgba(78,58,20,0.4)")),
                  borderRadius: 2,
                  padding: "12px 14px",
                  opacity: locked ? 0.65 : 1,
                  boxShadow: isCur ? "0 0 24px rgba(231,199,115,0.18)" : "0 4px 12px rgba(0,0,0,0.4)",
                }}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                    <div>
                      <div style={{
                        fontFamily:"ZCOOL XiaoWei, serif", fontSize: 11,
                        opacity: 0.6, letterSpacing:"0.35em",
                        color:"var(--gold-pale)",
                      }}>第 {["一","二","三","四","五"][i]} 章</div>
                      <div className="title-han" style={{
                        fontSize: 17, color: isCur ? "var(--gold-pale)" : "var(--paper)",
                        letterSpacing:"0.2em", textIndent:"0.2em",
                        marginTop: 2,
                      }}>{c.name}</div>
                    </div>
                    {locked && <SealTag size="sm" style={{transform:"rotate(8deg)"}}>封</SealTag>}
                    {isCur && (
                      <div style={{
                        fontSize: 10, color:"var(--gold-pale)",
                        letterSpacing:"0.3em", animation: "glowPulse 2s ease-in-out infinite",
                      }}>· 当前 ·</div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12.5, marginTop: 8, opacity: 0.78,
                    color:"rgba(231,217,179,0.85)",
                    fontStyle:"italic", lineHeight: 1.6,
                  }}>{c.brief}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="map" onNav={gotoPage}/>
      </div>
    </div>
  );
}

import { useState } from "react";
import { BottomNav, BottomSheet, GoldDivider, Topbar, PageHeader } from "../components";
import { ClueIcon } from "../components/art";
import { CLUES } from "../data";
import type { GameState } from "../data/types";
import { saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface CluePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

export function CluePage({ state, setState, gotoPage }: CluePageProps) {
  const [active, setActive] = useState<string | null>(null);

  const toggleCollect = (id: string) => {
    let cs = state.searchedClues || [];
    if (!cs.includes(id)) {
      cs = [...cs, id];
      const ns = { ...state, searchedClues: cs };
      setState(ns);
      saveState(ns);
    }
    setActive(id);
  };

  const collected = state.searchedClues || [];
  const enoughClues = collected.length >= 3;

  return (
    <div className="page night-deep-bg">
      <Topbar title="线 索 板" onBack={() => gotoPage("story")}/>

      <div className="page-scroll" style={{top: 56, bottom: 64, padding: "0 14px"}}>
        <PageHeader
          eyebrow="CLUE · BOARD"
          intro={<>医馆里能带走的，从来不止那本残卷。<br/>点开纸片，看看你还记得什么。</>}
        />

        <div style={{
          position:"relative", padding: "10px 0",
          background: "linear-gradient(180deg, rgba(11,17,20,0.5), rgba(5,8,11,0.5))",
          border: "1px dashed rgba(205,178,119,0.25)",
          borderRadius: 2,
        }}>
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gap: 12, padding: 12,
          }}>
            {CLUES.map((c, i) => {
              const has = collected.includes(c.id);
              const rot = (i % 2 === 0 ? -2 : 2) + (i % 3 === 0 ? -1 : 1);
              return (
                <button key={c.id} className="press"
                  onClick={() => toggleCollect(c.id)}
                  style={{
                    position:"relative",
                    background:"linear-gradient(180deg, #e9e2d0, #cabf9f)",
                    color:"var(--ink-deep)",
                    border:"1px solid rgba(70,62,38,0.5)",
                    padding: "10px 10px 12px",
                    transform: `rotate(${rot}deg)`,
                    cursor:"pointer",
                    boxShadow: has
                      ? "0 0 0 1px var(--jade), 0 0 16px rgba(95,168,146,0.25), 0 6px 18px rgba(0,0,0,0.55)"
                      : "0 6px 18px rgba(0,0,0,0.55)",
                    minHeight: 130,
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap: 6,
                    animation: `fadeInUp 350ms ease both ${i*70}ms`,
                  }}>
                  <div style={{
                    position:"absolute", top: -6, left: "50%",
                    transform: "translateX(-50%)",
                    width: 12, height: 12, borderRadius:"50%",
                    background: has
                      ? "radial-gradient(circle at 30% 30%, #d6f3e8, #2c6657)"
                      : "radial-gradient(circle at 30% 30%, #c5a06a, #463c22)",
                    boxShadow: has ? "0 0 8px var(--jade), 0 2px 4px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.5)",
                  }}/>
                  <div style={{
                    width: 56, height: 56,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <ClueIcon type={c.icon}/>
                  </div>
                  <div style={{
                    fontFamily:"ZCOOL XiaoWei, serif",
                    fontSize: 14, letterSpacing:"0.16em",
                    color:"var(--ink-deep)",
                  }}>{c.name}</div>
                  {has ? (
                    <div style={{
                      fontSize: 10, color:"var(--jade-deep)",
                      letterSpacing:"0.18em", marginTop: 2,
                    }}>· 已 阅 ·</div>
                  ) : (
                    <div style={{
                      fontSize: 10, color:"rgba(70,62,38,0.5)",
                      letterSpacing:"0.18em", marginTop: 2,
                    }}>· 未 阅 ·</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="fade-in" style={{
          margin: "18px 0 12px",
          padding: "14px 16px",
          textAlign: "center",
          background: enoughClues
            ? "linear-gradient(180deg, rgba(236,220,166,0.18), rgba(20,28,32,0.6))"
            : "linear-gradient(180deg, rgba(20,28,32,0.4), rgba(11,17,20,0.6))",
          border: "1px solid " + (enoughClues ? "var(--gold-pale)" : "rgba(70,62,38,0.5)"),
          borderRadius: 2,
        }}>
          {enoughClues ? (
            <div style={{
              fontFamily:"ZCOOL XiaoWei, serif",
              fontSize: 14, color:"var(--gold-pale)",
              letterSpacing:"0.18em", lineHeight: 1.7,
              textShadow:"0 0 12px rgba(236,220,166,0.3)",
            }}>
              也许真正该留下的，<br/>不是原卷，而是知识的活路。
            </div>
          ) : (
            <div style={{
              fontSize: 12, color:"rgba(228,224,208,0.6)",
              lineHeight: 1.7, letterSpacing:"0.06em",
            }}>
              已收集 {collected.length} / {CLUES.length}<br/>
              收集 3 条以上线索，会有新的领悟。
            </div>
          )}
        </div>

        <button className="btn-primary press" style={{width:"100%", marginTop: 6}}
          onClick={() => gotoPage("story")}>
          回 到 医 馆
        </button>
      </div>

      <BottomSheet open={!!active} onClose={() => setActive(null)}>
        {active && (() => {
          const c = CLUES.find(x => x.id === active);
          if (!c) return null;
          return (
            <div>
              <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 10}}>
                <div style={{
                  width: 48, height: 48,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(178,58,44,0.1)",
                  border:"1px solid rgba(70,62,38,0.4)",
                }}>
                  <ClueIcon type={c.icon} size={40}/>
                </div>
                <div>
                  <div className="title-han" style={{
                    fontSize: 17, color:"var(--ink-deep)",
                    letterSpacing:"0.16em",
                  }}>{c.title}</div>
                  <div style={{fontSize: 11, color:"rgba(70,62,38,0.7)", marginTop: 2, letterSpacing:"0.12em"}}>
                    · 线索 · {c.name}
                  </div>
                </div>
              </div>
              <GoldDivider/>
              <div style={{
                whiteSpace:"pre-line",
                fontSize: 14, lineHeight: 1.85,
                color:"var(--ink)",
                letterSpacing:"0.04em",
                fontStyle:"italic",
                padding:"8px 4px",
              }}>{c.body}</div>
              <div style={{
                marginTop: 12, padding: "10px 12px",
                background: "rgba(178,58,44,0.08)",
                borderLeft: "2px solid var(--vermillion)",
                fontSize: 12.5, color:"var(--vermillion-deep)",
                lineHeight: 1.7,
              }}>
                <strong style={{fontFamily:"ZCOOL XiaoWei, serif", marginRight: 8}}>批注</strong>
                {c.note}
              </div>
            </div>
          );
        })()}
      </BottomSheet>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="clue" onNav={gotoPage}/>
      </div>
    </div>
  );
}

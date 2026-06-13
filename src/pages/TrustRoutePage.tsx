import { useState } from "react";
import { CharacterCard, PaperPanel, SealTag, Topbar } from "../components";
import { TRUST_OPTIONS } from "../data";
import type { GameState } from "../data/types";
import { saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

interface TrustRoutePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

export function TrustRoutePage({ state, setState, gotoPage }: TrustRoutePageProps) {
  const [selected, setSelected] = useState<string | null>(state.trustedPerson || null);

  const confirm = () => {
    if (!selected) return;
    const ns: GameState = { ...state, trustedPerson: selected, currentChapter: 4 };
    setState(ns);
    saveState(ns);
    gotoPage("story");
  };

  const selChar = TRUST_OPTIONS.find(c => c.id === selected);

  return (
    <div className="page night-deep-bg">
      <Topbar title="寻 可 托 之 人" onBack={() => gotoPage("story")}/>

      <div className="page-scroll" style={{top: 56, bottom: 96, padding:"0 14px"}}>
        <div className="fade-in" style={{textAlign:"center", margin: "4px 0 14px"}}>
          <div style={{
            fontSize: 13, lineHeight: 1.8,
            color:"rgba(231,217,179,0.88)",
            letterSpacing:"0.05em",
          }}>
            四更将至。<br/>
            <span style={{color:"var(--gold-pale)"}}>你只能托付一人。</span>
          </div>
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr",
          gap: 10, paddingBottom: 14,
        }}>
          {TRUST_OPTIONS.map((c, i) => (
            <div key={c.id} className="fade-up" style={{animationDelay:`${i*70}ms`}}>
              <CharacterCard
                char={c}
                selected={selected === c.id}
                onSelect={() => setSelected(c.id)}
              />
            </div>
          ))}
        </div>

        {selChar && (
          <div className="fade-in" style={{marginTop: 4}}>
            <PaperPanel style={{padding: "14px 16px"}}>
              <div style={{
                display:"flex", alignItems:"center", gap: 10,
                marginBottom: 8,
              }}>
                <SealTag size="sm" style={{transform:"none"}}>{selChar.tag}</SealTag>
                <div className="title-han" style={{
                  fontSize: 16, color:"var(--ink-deep)",
                  letterSpacing:"0.16em",
                }}>{selChar.name}</div>
              </div>
              <div style={{
                fontSize: 13.5, lineHeight: 1.78,
                color:"var(--ink)",
                letterSpacing:"0.04em",
                fontStyle:"italic",
              }}>{selChar.detail}</div>
            </PaperPanel>
          </div>
        )}
      </div>

      <div style={{
        position:"absolute", left:0, right: 0, bottom: 0,
        padding:`12px 18px calc(16px + var(--safe-bottom))`,
        background: "linear-gradient(180deg, transparent, rgba(10,6,4,0.95) 30%)",
      }}>
        <button
          className="btn-primary press"
          onClick={confirm}
          disabled={!selected}
          style={{
            width:"100%",
            opacity: selected ? 1 : 0.4,
            filter: selected ? "none" : "grayscale(0.6)",
            cursor: selected ? "pointer" : "not-allowed",
          }}>
          {selected ? `确 认 托 付 · ${selChar?.name?.split("·")[0].trim() || ""}` : "尚 未 抉 择"}
        </button>
      </div>
    </div>
  );
}

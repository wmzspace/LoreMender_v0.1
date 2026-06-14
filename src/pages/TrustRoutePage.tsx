import { useState } from "react";
import { CharacterCard, PaperPanel, SealTag, Topbar, PageHeader } from "../components";
import { TRUST_OPTIONS } from "../data";
import type { GameState } from "../data/types";
import { saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

// Sentinel for "destroy the scroll" — not a person, so it can't be a Character id.
const BURN = "__burn__";

interface TrustRoutePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

export function TrustRoutePage({ state, setState, gotoPage }: TrustRoutePageProps) {
  const [selected, setSelected] = useState<string | null>(state.trustedPerson || null);

  const isBurn = selected === BURN;
  const selChar = TRUST_OPTIONS.find(c => c.id === selected);

  // This screen is now the single binding decision: the choice sets finalChoice
  // (which resolveEnding reads). Trust-candidate ids equal the finalChoice values
  // (wangji / chenbo / xuanyin); destroying maps to "burn".
  const confirm = () => {
    if (!selected) return;
    const ns: GameState = {
      ...state,
      trustedPerson: isBurn ? null : selected,
      finalChoice: isBurn ? "burn" : selected,
      currentChapter: 4,
    };
    setState(ns);
    saveState(ns);
    gotoPage("story");
  };

  const confirmLabel = !selected
    ? "尚 未 抉 择"
    : isBurn
      ? "确 认 · 毁 去 残 卷"
      : `确 认 托 付 · ${selChar?.name?.split("·")[0].trim() || ""}`;

  return (
    <div className="page night-deep-bg">
      <Topbar title="青 囊 何 归" onBack={() => gotoPage("story")}/>

      <div className="page-scroll" style={{top: 56, bottom: 96, padding:"0 14px"}}>
        <PageHeader
          eyebrow="THE ENTRUSTING"
          intro={<>四更将至。一卷青囊，<br/><span style={{color:"var(--gold-pale)"}}>该托付于人，还是毁于此夜？</span></>}
        />

        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr",
          gridAutoRows: "1fr",
          gap: 10, paddingBottom: 12,
        }}>
          {TRUST_OPTIONS.map((c, i) => (
            <div key={c.id} className="fade-up" style={{animationDelay:`${i*70}ms`, height:"100%"}}>
              <CharacterCard
                char={c}
                selected={selected === c.id}
                onSelect={() => setSelected(c.id)}
              />
            </div>
          ))}
        </div>

        {/* 焚书:不托付于任何人 */}
        <button
          className="press lift"
          onClick={() => setSelected(BURN)}
          aria-pressed={isBurn}
          style={{
            width:"100%", display:"flex", alignItems:"center", gap:12,
            padding:"12px 14px", cursor:"pointer", textAlign:"left",
            background: isBurn
              ? "linear-gradient(180deg, rgba(178,58,44,0.32), rgba(40,16,10,0.88))"
              : "linear-gradient(180deg, rgba(30,18,12,0.9), rgba(15,8,5,0.9))",
            border: "1px solid " + (isBurn ? "var(--vermillion)" : "rgba(178,58,44,0.4)"),
            borderRadius: 2, color:"var(--paper)",
            boxShadow: isBurn
              ? "0 0 0 1px var(--vermillion), 0 0 28px rgba(178,58,44,0.3)"
              : "0 4px 14px rgba(0,0,0,0.5)",
          }}>
          <SealTag size="sm" style={{transform:"none", background:"var(--vermillion-deep)"}}>焚</SealTag>
          <div style={{flex:1}}>
            <div className="title-han" style={{
              fontSize:15, letterSpacing:"0.16em",
              color: isBurn ? "#ffd0c0" : "var(--paper)",
            }}>毁 去 残 卷</div>
            <div style={{fontSize:11.5, opacity:0.78, marginTop:3, lineHeight:1.5, color:"rgba(228,224,208,0.82)"}}>
              不托付于任何人，让《青囊经》随今夜一同湮灭。
            </div>
          </div>
        </button>

        {selChar && (
          <div className="fade-in" style={{marginTop: 12}}>
            <PaperPanel style={{padding: "14px 16px"}}>
              <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 8}}>
                <SealTag size="sm" style={{transform:"none"}}>{selChar.tag}</SealTag>
                <div className="title-han" style={{fontSize: 16, color:"var(--ink-deep)", letterSpacing:"0.16em"}}>
                  {selChar.name}
                </div>
              </div>
              <div style={{fontSize: 13.5, lineHeight: 1.78, color:"var(--ink)", letterSpacing:"0.04em", fontStyle:"italic"}}>
                {selChar.detail}
              </div>
            </PaperPanel>
          </div>
        )}
      </div>

      <div style={{
        position:"absolute", left:0, right: 0, bottom: 0,
        padding:`12px 18px calc(16px + var(--safe-bottom))`,
        background: "linear-gradient(180deg, transparent, rgba(7,11,14,0.95) 30%)",
      }}>
        <button
          className="btn-primary press"
          onClick={confirm}
          disabled={!selected}
          style={{ width:"100%" }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

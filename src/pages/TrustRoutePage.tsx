import { useState } from "react";
import { TRUST_OPTIONS } from "../data";
import type { GameState } from "../data/types";
import { saveBeat, saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";
import { Topbar } from "../components";

interface TrustRoutePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

const BURN = "burn";

export function TrustRoutePage({ state, setState, gotoPage }: TrustRoutePageProps) {
  const [selected, setSelected] = useState<string | null>(state.finalChoice || null);

  const confirm = () => {
    if (!selected) return;
    const ns: GameState = {
      ...state,
      trustedPerson: selected === BURN ? null : selected,
      finalChoice: selected as GameState["finalChoice"],
    };
    setState(ns);
    saveState(ns);
    saveBeat(5, 4);
    gotoPage("story");
  };

  return (
    <div className="page night-deep-bg">
      <Topbar title="青囊归处" onBack={() => gotoPage("story")} />
      <div className="vignette" />
      <div className="page-scroll" style={{ top: 56, bottom: 96, padding: "0 16px" }}>
        <div style={{
          height: 170,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(205,178,119,0.30)",
          borderRadius: 4,
          background: "#071013",
          marginBottom: 16,
        }}>
          <img
            src="/images/levels/1/chapters/trust/trust_scene.webp"
            alt="青囊归处"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(7,11,14,0.94))" }} />
          <div className="title-han" style={{ position: "absolute", left: 16, bottom: 14, color: "var(--gold-pale)", fontSize: 22 }}>
            残卷应归何处
          </div>
        </div>

        <div style={{ color: "var(--paper)", opacity: 0.76, fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>
          前四章所得道具、最佳成绩与信任，会影响后世怎样读到这卷残术。此刻不再考验手速，只考验托付。
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {TRUST_OPTIONS.map(c => {
            const selectedThis = selected === c.id;
            return (
              <button
                key={c.id}
                className="press"
                onClick={() => setSelected(c.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: `1px solid ${selectedThis ? "var(--jade)" : "rgba(205,178,119,0.28)"}`,
                  background: selectedThis ? "rgba(95,168,146,0.13)" : "rgba(10,16,20,0.62)",
                  borderRadius: 4,
                  padding: 13,
                  color: "var(--paper)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={c.portrait} alt={c.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", objectPosition: "center top" }} />
                  <div>
                    <div className="title-han" style={{ color: selectedThis ? "var(--jade-pale)" : "var(--gold-pale)", fontSize: 16 }}>{c.name}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.65, opacity: 0.75, marginTop: 9 }}>{c.short}</div>
              </button>
            );
          })}

          <button
            className="press"
            onClick={() => setSelected(BURN)}
            style={{
              width: "100%",
              textAlign: "left",
              border: `1px solid ${selected === BURN ? "#b23a2c" : "rgba(178,58,44,0.35)"}`,
              background: selected === BURN ? "rgba(178,58,44,0.18)" : "rgba(20,9,7,0.62)",
              borderRadius: 4,
              padding: 13,
              color: "var(--paper)",
            }}
          >
            <div className="title-han" style={{ color: selected === BURN ? "#ffd0c0" : "var(--gold-pale)", fontSize: 16 }}>焚毁残卷</div>
            <div style={{ fontSize: 12, lineHeight: 1.65, opacity: 0.75, marginTop: 7 }}>不托付任何人，让残术随此夜化灰。</div>
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 18px calc(16px + var(--safe-bottom))", background: "linear-gradient(180deg, transparent, rgba(7,11,14,0.96) 30%)" }}>
        <button className="btn-primary press" disabled={!selected} onClick={confirm} style={{ width: "100%" }}>
          确认归处
        </button>
      </div>
    </div>
  );
}

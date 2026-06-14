import { useState, type ReactNode } from "react";
import { SealTag, Topbar, PageHeader } from "../components";
import { CharSilhouette } from "../components/art";
import { TRUST_OPTIONS } from "../data";
import type { GameState } from "../data/types";
import { saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";

// Sentinel for "destroy the scroll" — not a person, so it can't be a Character id.
const BURN = "__burn__";

// ── 墨·青·金·朱 配色（与 global.css 变量对齐） ────────────────────
const GOLD_PALE = "#ecdca6";
const GOLD_DEEP = "#8f7846";
const JADE = "#5fa892";
const JADE_PALE = "#a6dccb";
const VERMILLION = "#b23a2c";
const VERMILLION_DEEP = "#6e1f18";
const PAPER = "rgba(228,224,208,";

interface TrustRoutePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

// ── 圆形烛光徽：人物剪影 / 焚字玺，呼应进程页的烛光圆牌 ─────────
function PortraitMedallion({
  size = 62, ring, glow = false, children,
}: { size?: number; ring: string; glow?: boolean; children: ReactNode }) {
  const r = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {glow && (
          <circle cx={r} cy={r} r={r} fill="none" stroke={ring} strokeOpacity={0.3} strokeWidth={5}
            style={{ filter: "blur(4px)" }} />
        )}
        <circle cx={r} cy={r} r={r - 1.5} fill="#0c1218" />
      </svg>
      <div style={{ position: "absolute", inset: 1.5, borderRadius: "50%", overflow: "hidden" }}>
        {children}
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <circle cx={r} cy={r} r={r - 1.5} fill="none" stroke={ring}
          strokeWidth={glow ? 2 : 1.2} opacity={glow ? 1 : 0.55} />
      </svg>
    </div>
  );
}

// ── 烛焰小图标：提示「四更将至」，时间在流逝 ─────────────────────
function FlameGlyph() {
  return (
    <svg width="10" height="13" viewBox="0 0 12 16" style={{ animation: "glowPulse 2.2s ease-in-out infinite" }}>
      <path d="M6 1 C2 5.5 1 8.5 3 11.5 C2.3 9.3 3.5 7.5 5 6.5 C4.3 9 6 10 5.5 12 C8.3 9.7 9.3 7 7.5 5 C8.7 6 9.3 8.3 7.7 10.5 C10.3 7.7 9.3 4 6 1 Z" fill="#ffcf8a" />
      <path d="M6 6.5 C5 8 5.3 9.6 6.3 10.8 C7.4 9.3 7.3 7.7 6 6.5 Z" fill="#d98a3f" opacity="0.75" />
    </svg>
  );
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

  const confirmStyle = isBurn ? {
    background: "linear-gradient(180deg, #ffb39a 0%, #b23a2c 55%, #6e1f18 100%)",
    borderColor: VERMILLION,
    color: "#1a0808",
    boxShadow: "0 0 0 1px rgba(255,179,154,0.35), 0 0 26px rgba(178,58,44,0.35), 0 6px 18px rgba(0,0,0,0.5)",
  } : {};

  return (
    <div className="page night-deep-bg">
      <Topbar title="青 囊 何 归" onBack={() => gotoPage("story")}/>
      <div className="vignette"/>

      <div className="page-scroll" style={{top: 56, bottom: 96, padding:"0 14px"}}>
        <PageHeader
          eyebrow="THE ENTRUSTING"
          intro={<>
            <span style={{display:"inline-flex", alignItems:"center", gap:5}}>
              四更将至 <FlameGlyph/>
            </span>
            。一卷青囊，<br/>
            <span style={{color:"var(--gold-pale)"}}>该托付于人，还是毁于此夜？</span>
          </>}
        />

        {/* 抉择行：三位候选人 + 焚书，同一列纵向排开，每一行都是一种命运 */}
        <div style={{display:"flex", flexDirection:"column", gap: 10, paddingBottom: 12}}>
          {TRUST_OPTIONS.map((c, i) => {
            const sel = selected === c.id;
            return (
              <button key={c.id}
                className="press fade-up"
                style={{
                  animationDelay: `${i * 70}ms`,
                  display: "flex", width: "100%", textAlign: "left", gap: 12,
                  padding: "12px 14px", borderRadius: 3, cursor: "pointer",
                  background: sel
                    ? "linear-gradient(180deg, rgba(95,168,146,0.16), rgba(10,16,20,0.88))"
                    : "linear-gradient(180deg, rgba(15,22,26,0.85), rgba(9,14,17,0.85))",
                  border: `1px solid ${sel ? JADE : "rgba(205,178,119,0.3)"}`,
                  boxShadow: sel
                    ? `0 0 0 1px ${JADE}, 0 0 26px rgba(95,168,146,0.22)`
                    : "0 4px 14px rgba(0,0,0,0.4)",
                  color: "var(--paper)", transition: "all 220ms",
                }}
                onClick={() => setSelected(c.id)}
                aria-pressed={sel}
              >
                <PortraitMedallion ring={sel ? JADE : GOLD_DEEP} glow={sel}>
                  <CharSilhouette kind={c.silhouette} accent={sel ? JADE : GOLD_DEEP}/>
                </PortraitMedallion>

                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display:"flex", alignItems:"center", gap: 8, flexWrap:"wrap"}}>
                    <div className="title-han" style={{
                      fontSize: 15, letterSpacing:"0.16em",
                      color: sel ? JADE_PALE : GOLD_PALE,
                    }}>{c.name}</div>
                    <SealTag size="sm">{c.tag}</SealTag>
                  </div>
                  <div style={{fontSize: 11, opacity: 0.6, marginTop: 3, letterSpacing:"0.08em"}}>{c.role}</div>
                  <div style={{fontSize: 12, opacity: 0.85, marginTop: 6, lineHeight: 1.55, color: `${PAPER}0.85)`}}>{c.short}</div>

                  {sel && (
                    <div className="fade-in" style={{marginTop: 9, paddingTop: 9, borderTop: "1px solid rgba(166,220,203,0.22)"}}>
                      <div style={{fontSize: 12.5, lineHeight: 1.78, fontStyle:"italic", letterSpacing:"0.03em", color: JADE_PALE}}>
                        {c.detail}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* 焚书：不托付于任何人 —— 唯一的「朱印」选项，不可逆 */}
          <button
            className="press fade-up"
            style={{
              animationDelay: `${TRUST_OPTIONS.length * 70}ms`,
              display: "flex", width: "100%", textAlign: "left", gap: 12,
              padding: "12px 14px", borderRadius: 3, cursor: "pointer",
              background: isBurn
                ? "linear-gradient(180deg, rgba(178,58,44,0.24), rgba(20,8,5,0.9))"
                : "linear-gradient(180deg, rgba(26,16,11,0.85), rgba(12,7,5,0.85))",
              border: `1px solid ${isBurn ? VERMILLION : "rgba(178,58,44,0.35)"}`,
              boxShadow: isBurn
                ? `0 0 0 1px ${VERMILLION}, 0 0 26px rgba(178,58,44,0.28)`
                : "0 4px 14px rgba(0,0,0,0.4)",
              color: "var(--paper)", transition: "all 220ms",
            }}
            onClick={() => setSelected(BURN)}
            aria-pressed={isBurn}
          >
            <PortraitMedallion ring={isBurn ? VERMILLION : VERMILLION_DEEP} glow={isBurn}>
              <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#0c1218", fontFamily: "'ZCOOL XiaoWei', serif", fontSize: 24,
                color: isBurn ? "#ffd0c0" : VERMILLION_DEEP,
                textShadow: isBurn ? "0 0 14px rgba(178,58,44,0.7)" : "none",
              }}>焚</div>
            </PortraitMedallion>

            <div style={{flex: 1, minWidth: 0}}>
              <div className="title-han" style={{
                fontSize: 15, letterSpacing:"0.16em",
                color: isBurn ? "#ffd0c0" : GOLD_PALE,
              }}>毁 去 残 卷</div>
              <div style={{fontSize: 11, opacity: 0.6, marginTop: 3, letterSpacing:"0.08em"}}>不 托 付 · 不 留 存</div>
              <div style={{fontSize: 12, opacity: 0.85, marginTop: 6, lineHeight: 1.55, color: `${PAPER}0.82)`}}>
                不托付于任何人，让《青囊经》随今夜一同湮灭。
              </div>
            </div>
          </button>
        </div>
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
          style={{ width:"100%", ...confirmStyle }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

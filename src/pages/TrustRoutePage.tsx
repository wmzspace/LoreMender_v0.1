import { useState } from "react";
import { STORY, TRUST_OPTIONS } from "../data";
import type { Beat, GameState } from "../data/types";
import { saveBeat, saveState } from "../lib/storage";
import type { PageKey } from "../lib/routes";
import { PageShell } from "../components";

/** 与 StoryPage.flattenBeats 一致地展开 ch5，返回「gotoTrust 之后一句」的下标（resume 点）。 */
function resumeIndexAfterTrust(state: GameState): number {
  const map = state as unknown as Record<string, unknown>;
  const box = map.boxCompartment ?? "missed"; // 与 flattenBeats 的默认一致
  const flat: Beat[] = [];
  const walk = (bs: Beat[]) => {
    for (const b of bs) {
      if ("ifKey" in b) {
        const v = b.ifKey === "boxCompartment" ? box : map[b.ifKey];
        if (String(v ?? "") === b.ifVal) walk(b.beats);
      } else {
        flat.push(b);
      }
    }
  };
  walk(STORY.ch5?.beats ?? []);
  const idx = flat.findIndex(b => "gotoTrust" in b);
  return idx >= 0 ? idx + 1 : 0;
}

interface TrustRoutePageProps {
  state: GameState;
  setState: (s: GameState) => void;
  gotoPage: (p: PageKey) => void;
}

const BURN = "burn";

// 四条归处的描述文案（对齐需求文档「最终抉择」）
const ROUTE_DESC: Record<string, string> = {
  chenbo: "民间经验之路。药方不锁进高阁，而在街巷间誊写、背诵、校正。可能散失，也可能因人而异，但它最接近真正需要救命的人。",
  wangji: "制度府库之路。医书进入曹府医案，有制度保护，也有抄本流传的可能。但门第、功名与权力会重新筛选文字，不合时宜的提醒可能被删去，民间经验可能被轻看。",
  xuanyin: "歌诀传播之路。医理被改成歌诀，带向乐坊、山门与村巷。后世未必能得到全卷，却能从曲调里记住该救什么、又该避开什么。残术不再完整，但没有完全失声。",
};

// 选择前提示：依信任最高者 / 低完成度数量，给一句情感旁白（轻量倾向）
function preChoiceHint(state: GameState): string | null {
  const lowGrades = Object.values(state.gameResults ?? {}).filter(r => r.best === "low").length;
  const trusts = [
    { v: state.chenbo_trust || 0, line: "你记得街市上那个孩子重新平稳的呼吸。" },
    { v: state.wangji_trust || 0, line: "你记得问诊录上那行「医术当以济世为先」。" },
    { v: state.xuanyin_trust || 0, line: "你记得巷尾那首终于唱对的歌。" },
  ];
  // 焚毁倾向：至少两个小游戏低完成度 + 至少一条信任为零 → 对传承之路失望
  const burnishHint = lowGrades >= 2 && trusts.some(t => t.v === 0)
    ? "你一路看见医术被私藏、被锁住、被唱错，也看见它可能造成的危险。"
    : null;
  const top = trusts.slice().sort((a, b) => b.v - a.v)[0];
  if (top.v >= 2) return top.line; // 有明确的高信任 → 给对应回忆
  if (burnishHint) return burnishHint; // 焚毁倾向优先于低完成度提醒
  if (lowGrades >= 2) return "你还没有完全理解青囊，但天已经快亮了。";
  if (top.v > 0) return top.line;
  return null;
}

export function TrustRoutePage({ state, setState, gotoPage }: TrustRoutePageProps) {
  const [selected, setSelected] = useState<string | null>(state.finalChoice || null);
  const hint = preChoiceHint(state);

  const confirm = () => {
    if (!selected) return;
    const ns: GameState = {
      ...state,
      trustedPerson: selected === BURN ? null : selected,
      finalChoice: selected as GameState["finalChoice"],
    };
    setState(ns);
    saveState(ns);
    // 动态定位到「gotoTrust 之后一句」，避免重放，也避免停在 gotoTrust 转场 beat 上卡死。
    saveBeat(5, resumeIndexAfterTrust(ns));
    gotoPage("story");
  };

  return (
    <PageShell
      bg="night-deep-bg"
      title="青 囊 归 处"
      onBack={() => gotoPage("story")}
      footer={
        <div style={{ padding: "12px 18px calc(16px + var(--safe-bottom))", background: "linear-gradient(180deg, transparent, rgba(7,11,14,0.96) 30%)" }}>
          <button className="btn-primary press" data-sfx="confirm" disabled={!selected} onClick={confirm} style={{ width: "100%" }}>
            确认归处
          </button>
        </div>
      }
    >
        <div style={{
          height: "clamp(170px, 28vh, 280px)",
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

        {hint && (
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "10px 13px", marginBottom: 16,
            border: "1px solid rgba(95,168,146,0.3)",
            borderLeft: "3px solid var(--jade)",
            borderRadius: 3,
            background: "rgba(95,168,146,0.07)",
          }}>
            <div style={{ width: 4, height: 4, background: "var(--jade)", transform: "rotate(45deg)", flexShrink: 0, opacity: 0.8 }} />
            <div style={{
              fontSize: 12.5, fontStyle: "italic",
              color: "rgba(166,220,203,0.9)",
              lineHeight: 1.7, letterSpacing: "0.03em",
            }}>{hint}</div>
          </div>
        )}

        <div className="grid-2">
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
                <div style={{ fontSize: 12, lineHeight: 1.65, opacity: 0.75, marginTop: 9 }}>{ROUTE_DESC[c.id] ?? c.short}</div>
              </button>
            );
          })}

          <button
            className="press span-all"
            onClick={() => setSelected(BURN)}
            style={{
              width: "100%",
              textAlign: "left",
              gridColumn: "1 / -1",
              border: `1px solid ${selected === BURN ? "#b23a2c" : "rgba(178,58,44,0.35)"}`,
              background: selected === BURN ? "rgba(178,58,44,0.18)" : "rgba(20,9,7,0.62)",
              borderRadius: 4,
              padding: 13,
              color: "var(--paper)",
            }}
          >
            <div className="title-han" style={{ color: selected === BURN ? "#ffd0c0" : "var(--gold-pale)", fontSize: 16 }}>焚毁残卷</div>
            <div style={{ fontSize: 12, lineHeight: 1.65, opacity: 0.75, marginTop: 7 }}>火光保住了秘密，也烧断了去路。无人能借它作恶，也无人能据它救人。后世只记得那本应当存在的书。</div>
          </button>
        </div>
    </PageShell>
  );
}

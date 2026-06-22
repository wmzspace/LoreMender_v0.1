import { useState } from "react";
import { STORY, TRUST_OPTIONS, searchPressure } from "../data";
import type { Beat, GameState } from "../data/types";
import { saveBeat, saveState } from "../lib/storage";
import { matchIf } from "../lib/beats";
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
        if (matchIf(v, b.ifVal, b.ifCmp)) walk(b.beats);
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
  burn: "火光保住了秘密，也烧断了去路。无人能借它作恶，也无人能据它救人。后世只记得那本应当存在的书。",
};

// 与该人物「交托」那一刻的对话插图——选择前再看一眼，提醒这是托付给谁。
const ROUTE_IMAGE: Record<string, string> = {
  chenbo: "/images/levels/1/chapters/ch2_beats/scene_09_prescription_handoff.webp",
  wangji: "/images/levels/1/chapters/ch3_beats/ch3_09_documents_handoff.webp",
  xuanyin: "/images/levels/1/chapters/ch4_beats/scene_09_song_page_handoff.webp",
  burn: "/images/levels/1/chapters/endings/ending_burn.webp",
};

// 手风琴收起态封面——专为本页准备的高清肖像（不影响对话框等其他场景仍用的小像）。
const ROUTE_PORTRAIT: Record<string, string> = {
  chenbo: "/images/levels/1/chapters/ch5_beats/trust_portrait_chenbo.webp",
  wangji: "/images/levels/1/chapters/ch5_beats/trust_portrait_wangji.webp",
  xuanyin: "/images/levels/1/chapters/ch5_beats/trust_portrait_xuanyin.webp",
};

// 选择前提示：依信任最高者 / 低完成度数量，给一句情感旁白（轻量倾向）
function preChoiceHint(state: GameState): string | null {
  const lowGrades = Object.values(state.gameResults ?? {}).filter(r => r.best === "low").length;
  const trusts = [
    { v: state.chenbo_trust || 0, line: "你记得街市上那个孩子重新平稳的呼吸。" },
    { v: state.wangji_trust || 0, line: "你记得问诊录上那行「医术当以济世为先」。" },
    { v: state.xuanyin_trust || 0, line: "你记得巷尾那首终于唱对的歌。" },
  ];
  // 焚毁倾向：至少两个小游戏低完成度 + 至少一条信任未建立(≤0) → 对传承之路失望
  const burnishHint = lowGrades >= 2 && trusts.some(t => t.v <= 0)
    ? "你一路看见医术被私藏、被锁住、被唱错，也看见它可能造成的危险。"
    : null;
  const top = trusts.slice().sort((a, b) => b.v - a.v)[0];
  if (top.v >= 1) return top.line; // 有明确的高信任(对应小游戏达高分) → 给对应回忆
  if (burnishHint) return burnishHint; // 焚毁倾向优先于低完成度提醒
  if (lowGrades >= 2) return "你还没有完全理解青囊，但天已经快亮了。";
  if (top.v > 0) return top.line;
  return null;
}

function TrustAccordionItem({
  id, name, tag, portrait, desc, image, selected, active, locked, lockedLabel, onPick, onHover, onLeave,
}: {
  id: string;
  name: string;
  tag?: string;
  portrait?: string;
  desc: string;
  image: string;
  selected: boolean;
  active: boolean;
  locked: boolean;
  lockedLabel: string;
  onPick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      key={id}
      className={"trust-acc-item" + (active ? " is-active" : "") + (selected ? " is-selected" : "") + (locked ? " is-locked" : "")}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={() => { if (!locked) onPick(); }}
      role="button"
      aria-disabled={locked}
      tabIndex={0}
    >
      <img src={portrait ?? image} alt="" className="trust-acc-bg trust-acc-bg--portrait" />
      <img src={image} alt="" className="trust-acc-bg trust-acc-bg--scene" />
      <div className="trust-acc-scrim" />

      <div className="trust-acc-spine">{name}</div>

      <div className="trust-acc-detail">
        <div className="trust-acc-detail-head">
          <strong>{name}</strong>
          {tag && <span>{tag}</span>}
        </div>
        <div className="trust-acc-detail-desc">{desc}</div>
      </div>

      {locked
        ? <div className="trust-acc-locked">{lockedLabel}</div>
        : selected && <div className="trust-acc-pick">已 选</div>}
    </div>
  );
}

function trustOf(state: GameState, id: string): number {
  const trustField = `${id}_trust` as keyof GameState;
  return Number(state[trustField] ?? 0);
}

// 追索压力达到 5：与 resolveEnding 的强制焚尽阈值一致——已经被围到这个地步，
// 三个人都护不住这卷残术了，只剩焚毁这条路。
function isPressureForced(state: GameState): boolean {
  return searchPressure(state) >= 5;
}

// 选择门槛：陈伯/王济/玄音需要与其建立起码的信任(≥1)；焚毁则在「焚毁倾向足够坚定(≥2)」
// 或「三人都没建立起信任、已无人可托」时开放——总要留一条路可走，不能四项全锁。
// 追索压力≥5 时无视信任，强制只能选焚毁(与 endings.ts 的强制焚尽阈值保持一致)。
// 门槛与 endings.ts 里「真结局」所需的信任(≥2)是两件事：这里只挡「完全没交情/没念头」，
// 真假结局仍按 resolveEnding 的完整条件判定。
function isEligible(state: GameState, id: string): boolean {
  if (isPressureForced(state)) return id === BURN;
  if (id === BURN) {
    const noOneTrusted = ["chenbo", "wangji", "xuanyin"].every(p => trustOf(state, p) < 1);
    return (state.burn_tendency || 0) >= 2 || noOneTrusted;
  }
  return trustOf(state, id) >= 1;
}

const LOCKED_LABEL: Record<string, string> = {
  chenbo: "信任度不足", wangji: "信任度不足", xuanyin: "信任度不足", burn: "焚毁倾向不足",
};

function lockedLabelFor(state: GameState, id: string): string {
  if (isPressureForced(state) && id !== BURN) return "追索压力过高";
  return LOCKED_LABEL[id];
}

export function TrustRoutePage({ state, setState, gotoPage }: TrustRoutePageProps) {
  const [selected, setSelected] = useState<string | null>(state.finalChoice || null);
  const [hovered, setHovered] = useState<string | null>(null);
  const hint = preChoiceHint(state);
  // 手风琴：悬停优先展开；没有悬停时，已选中的那条默认展开。都没有时四条等宽。
  const active = hovered ?? selected ?? null;

  const confirm = () => {
    if (!selected || !isEligible(state, selected)) return;
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
      title=""
      onBack={() => gotoPage("story")}
      backdrop={
        <>
          <img src="/images/levels/1/chapters/ch5_beats/scene_05_four_mentors.webp" alt="" className="trust-bg" />
          <div className="trust-bg-scrim" />
        </>
      }
      footer={
        <div className="trust-footer">
          <button className="btn-primary press" data-sfx="confirm" disabled={!selected} onClick={confirm} style={{ width: "100%", maxWidth: 440, margin: "0 auto", display: "flex" }}>
            确认归处
          </button>
        </div>
      }
    >
        <div className="trust-headline">你 将 把 青 囊 残 卷 托 付 给</div>
        <div className="trust-intro">
          前四章的游玩会影响后世怎样读到这卷残术。把鼠标停在每张脸上，再看一眼当时的承诺。
        </div>

        {hint && (
          <div className="trust-hint">
            <div className="trust-hint-mark" />
            <div className="trust-hint-text">{hint}</div>
          </div>
        )}

        <div className="trust-acc">
          {TRUST_OPTIONS.map(c => (
            <TrustAccordionItem
              key={c.id}
              id={c.id}
              name={c.name}
              tag={c.tag}
              portrait={ROUTE_PORTRAIT[c.id] ?? c.portrait}
              desc={ROUTE_DESC[c.id] ?? c.short ?? ""}
              image={ROUTE_IMAGE[c.id]}
              selected={selected === c.id}
              active={active === c.id}
              locked={!isEligible(state, c.id)}
              lockedLabel={lockedLabelFor(state, c.id)}
              onPick={() => setSelected(c.id)}
              onHover={() => setHovered(c.id)}
              onLeave={() => setHovered(null)}
            />
          ))}
          <TrustAccordionItem
            id={BURN}
            name="焚毁残卷"
            tag="付之一炬"
            desc={ROUTE_DESC.burn}
            image={ROUTE_IMAGE.burn}
            selected={selected === BURN}
            active={active === BURN}
            locked={!isEligible(state, BURN)}
            lockedLabel={LOCKED_LABEL[BURN]}
            onPick={() => setSelected(BURN)}
            onHover={() => setHovered(BURN)}
            onLeave={() => setHovered(null)}
          />
        </div>
    </PageShell>
  );
}

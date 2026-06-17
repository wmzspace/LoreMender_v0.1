import type { Ending, EndingId, GameState } from "../../types";

export const ENDINGS: Record<string, Ending> = {
  chenbo_true: {
    id: "chenbo_true",
    name: "医者人间",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "书没有留下，医道留下了。",
    body: "你把《青囊经》交给了陈伯。\n他不识字，却把方子一条条背下来，教给街市的百姓。\n千年后，那些方子化作无数药方，流散人间。\n华佗在牢中闭上了眼睛。嘴角，有一丝笑意。",
    glyph: "shoots",
  },
  xuanyin_fallback: {
    id: "xuanyin_fallback",
    name: "残卷余音",
    rank: "遗憾半修",
    rankColor: "#8f7846",
    epitaph: "只有只言片语，流传于世。",
    body: "你把《青囊经》交给了玄音。\n她带着医书入山，藏于道观深处。\n数百年后，战火烧毁山门，残卷不知所终。\n只有只言片语，流传于世。",
    glyph: "wall",
  },
  wangji_trap: {
    id: "wangji_trap",
    name: "重锁深阁",
    rank: "遗憾未竟",
    rankColor: "#6e1f18",
    epitaph: "大部分内容，被锁进曹氏秘库，再未见光。",
    // 高信任版本（getEndingBody 会根据 wangji_trust 动态选择）
    body: "你把《青囊经》交给了王济。\n他将医书献给曹操。曹营的医官抄录了部分方子。\n但大部分内容，被锁进曹氏秘库，再未见光。\n多年以后，有人从府库残页中读见华佗之名，却再难听见街市上的咳声与哭声。",
    glyph: "wall",
  },
  burn_ending: {
    id: "burn_ending",
    name: "青囊焚尽",
    rank: "遗憾焚绝",
    rankColor: "#b23a2c",
    epitaph: "外科之术，从此失传。",
    body: "你拿起蜡烛，点燃了《青囊经》。\n竹简在火光中卷曲、变黑、化为灰烬。\n华佗没有看你。他望着窗外，很久很久。\n外科之术，从此失传。",
    glyph: "fire",
  },
};

export function resolveEnding(state: GameState): EndingId {
  const highCount = Object.values(state.gameResults ?? {}).filter(r => r.best === "high").length;
  // 病案未按身份排序：孩童排首位即可（high=完全正确, mid=前两位正确，均以孩童领先）
  const caseRank = state.gameResults?.["case_triage"]?.best;
  const caseTriageOk = caseRank === "high" || caseRank === "mid";

  // 真结局：托付陈伯 + 陈伯信任高(>=2) + 至少两个小游戏高完成度 + 病案未按身份排序
  if (
    state.finalChoice === "chenbo" &&
    state.chenbo_trust >= 2 &&
    highCount >= 2 &&
    caseTriageOk
  ) return "chenbo_true";
  if (state.finalChoice === "chenbo") return "xuanyin_fallback";
  if (state.finalChoice === "xuanyin") return "xuanyin_fallback";
  if (state.finalChoice === "wangji") return "wangji_trap";
  if (state.finalChoice === "burn") return "burn_ending";
  return "xuanyin_fallback";
}

/** 王济结局低信任版本 */
const WANGJI_BODY_LOW = "你把《青囊经》交给了王济。\n他将医书献给曹操。曹营的医官抄录了部分方子。\n但大部分内容，被锁进曹氏秘库，再未见光。\n华佗在牢中听闻，沉默了很久。";

/** 根据信任值动态返回结局正文；王济结局高信任用 ENDINGS 中的默认 body，低信任用遗憾版本 */
export function getEndingBody(state: GameState, endId: EndingId): string {
  if (endId === "wangji_trap") {
    return (state.wangji_trust ?? 0) >= 2
      ? ENDINGS.wangji_trap.body
      : WANGJI_BODY_LOW;
  }
  return ENDINGS[endId]?.body ?? "";
}

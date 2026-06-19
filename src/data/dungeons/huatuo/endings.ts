import type { Ending, EndingId, GameState } from "../../types";

export const ENDINGS: Record<string, Ending> = {
  chenbo_true: {
    id: "chenbo_true",
    name: "医者人间",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "青囊朽草木，医术遍人间",
    body: "你将《青囊经》交予陈伯。\n他不通文墨，一字一句默诵方药，游走市井救苦济民。\n千载光阴更迭，经中妙法散落民间，化作万千济世良方。\n华佗倚壁而眠，毕生仁术落于民间，心中再无遗憾。",
    glyph: "shoots",
  },
  chenbo_fallback: {
    id: "chenbo_fallback",
    name: "草木有遗",
    rank: "遗憾半修",
    rankColor: "#8f7846",
    epitaph: "老手能救急，验方难成签",
    body: "你将《青囊经》交予陈伯。\n他凭一双老手救人无数，却始终没能把方药整理成人人可读的药签。\n他年事渐高，手上的药渍一种种淡去。\n那些救命的法子，终究随他的手，慢慢散在了市井里。",
    glyph: "shoots",
  },
  xuanyin_true: {
    id: "xuanyin_true",
    name: "弦歌不辍",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "医理入弦歌，传唱济苍生",
    body: "你把《青囊经》谱成了歌。\n玄音带着歌诀走过乐坊、山门与村巷，连孩童也能哼上几句。\n字简会被烧、会被夺，曲子却藏在千万人口中。\n医理随弦歌流转人间，再难被一座库、一场火湮没。",
    glyph: "living",
  },
  xuanyin_fallback: {
    id: "xuanyin_fallback",
    name: "残卷余音",
    rank: "遗憾半修",
    rankColor: "#8f7846",
    epitaph: "兵戈毁古卷，余音寥难寻",
    body: "你把《青囊经》交给了玄音。\n他带着医书入山，藏于道观深处。\n数百年后，战火烧毁山门，残卷不知所终。\n只有只言片语，流传于世。",
    glyph: "wall",
  },
  wangji_trap: {
    id: "wangji_trap",
    name: "重锁深阁",
    rank: "遗憾未竟",
    rankColor: "#6e1f18",
    epitaph: "良方锁侯府，黎庶无缘观",
    // 高信任版本（getEndingBody 会根据 wangji_trust 动态选择）
    body: "你把《青囊经》交给了王济。\n王济将《青囊经》献于曹操，宫中只截取浅方留存，正本永久封藏曹氏秘库。\n后世偶拾残纸知华佗盛名，寻常百姓却永无机会习得完整医术。",
    glyph: "wall",
  },
  burn_ending: {
    id: "burn_ending",
    name: "青囊焚尽",
    rank: "遗憾焚绝",
    rankColor: "#b23a2c",
    epitaph: "烈焰吞竹简，仙术失传人",
    body: "你拿起蜡烛，点燃了《青囊经》。\n竹简在火光中卷曲、变黑、化为灰烬。\n华佗沉默地望向窗外苍生。\n外科之术，从此失传。",
    glyph: "fire",
  },
};

export function resolveEnding(state: GameState): EndingId {
  const highCount = Object.values(state.gameResults ?? {}).filter(r => r.best === "high").length;
  // 病案未按身份排序：孩童排首位即可（high=完全正确, mid=前两位正确，均以孩童领先）
  const caseRank = state.gameResults?.["case_triage"]?.best;
  const caseTriageOk = caseRank === "high" || caseRank === "mid";

  // 「选谁就是谁的结局」：最终抉择决定结局归属，绝不跳到别人；
  // 同一人内部再按达成度分「圆满版 / 遗憾版」两套文案。
  switch (state.finalChoice) {
    case "chenbo":
      // 圆满：陈伯信任高(>=2) + 至少两个小游戏高完成度 + 病案未按身份排序
      return state.chenbo_trust >= 2 && highCount >= 2 && caseTriageOk
        ? "chenbo_true"
        : "chenbo_fallback";
    case "xuanyin":
      // 圆满：玄音信任高(>=2) + 至少两个小游戏高完成度
      return state.xuanyin_trust >= 2 && highCount >= 2
        ? "xuanyin_true"
        : "xuanyin_fallback";
    case "wangji":
      return "wangji_trap"; // 圆满/遗憾由 getEndingBody 按 wangji_trust 区分
    case "burn":
      return "burn_ending";
    default:
      return "xuanyin_fallback"; // 仅在未作最终抉择的异常数据下兜底
  }
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

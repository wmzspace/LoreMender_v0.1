import type { Ending, EndingId, GameState } from "../../types";

export const ENDINGS: Record<EndingId, Ending> = {
  chenbo_true: {
    id: "chenbo_true", name: "医者人间", rank: "典故修补", rankColor: "#3a6b58",
    epitaph: "书没有留下，医道留下了。",
    body: "你把《青囊经》交给了陈伯。\n\n他不识字，却把方子一条条背下来，教给街市的百姓。\n\n千年后，那些方子化作无数药方，流散人间。\n\n华佗在牢中闭上了眼睛。嘴角，有一丝笑意。",
    glyph: "shoots",
  },
  xuanyin_fallback: {
    id: "xuanyin_fallback", name: "残卷余音", rank: "遗憾半修", rankColor: "#6b5a2a",
    epitaph: "只有只言片语，流传于世。",
    body: "你把《青囊经》交给了玄音道人。\n\n他带着医书入山，藏于道观深处。\n\n数百年后，战火烧毁山门，残卷不知所终。\n\n只有只言片语，流传于世。",
    glyph: "wall",
  },
  wangji_trap: {
    id: "wangji_trap", name: "重锁深阁", rank: "遗憾未竟", rankColor: "#8a3a2a",
    epitaph: "大部分内容，被锁进曹氏秘库，再未见光。",
    body: "你把《青囊经》交给了王济。\n\n他将医书献给曹操。曹营的医官抄录了部分方子。\n\n但大部分内容，被锁进曹氏秘库，再未见光。\n\n华佗在牢中听闻，沉默了很久。",
    glyph: "fire",
  },
  burn_ending: {
    id: "burn_ending", name: "青囊焚尽", rank: "遗憾焚绝", rankColor: "#6b1a0a",
    epitaph: "外科之术，从此失传。",
    body: "你拿起蜡烛，点燃了《青囊经》。\n\n竹简在火光中卷曲、变黑、化为灰烬。\n\n华佗没有看你。他望着窗外，很久很久。\n\n外科之术，从此失传。",
    glyph: "fire",
  },
};

export function resolveEnding(state: GameState): EndingId {
  const { finalChoice } = state;
  if (finalChoice === "chenbo") return "chenbo_true";
  if (finalChoice === "xuanyin") return "xuanyin_fallback";
  if (finalChoice === "wangji") return "wangji_trap";
  if (finalChoice === "burn") return "burn_ending";
  return "xuanyin_fallback";
}

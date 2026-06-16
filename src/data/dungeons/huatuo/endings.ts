import type { Ending, EndingId, GameState } from "../../types";

export const ENDINGS: Record<string, Ending> = {
  chenbo_true: {
    id: "chenbo_true",
    name: "医者人间",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "书未全存，医道却入了人间。",
    body: "你把残卷托给陈伯。药方没有被锁进高阁，而是在街巷之间一遍遍誊写、背诵、校正。许多内容终会散失，可有些用法变成乡间口耳相传的救急法门。华佗闭眼前，终于听见牢外有人仍在问药。",
    glyph: "shoots",
  },
  xuanyin_fallback: {
    id: "xuanyin_fallback",
    name: "残卷余音",
    rank: "遗憾半修",
    rankColor: "#8f7846",
    epitaph: "歌诀传得远，禁忌也一并留下。",
    body: "你把残卷托给玄音。他把难懂的医理改作歌诀，带向乐坊与山门。后世未必能得到全卷，却能从曲调里记住该救什么、又该避开什么。残术不再完整，但没有完全失声。",
    glyph: "wall",
  },
  wangji_trap: {
    id: "wangji_trap",
    name: "重锁深阁",
    rank: "遗憾未竟",
    rankColor: "#6e1f18",
    epitaph: "卷入权门的书，终究少见天光。",
    body: "你把残卷托给王济。他确有能力保下一部分内容，也确实让它进入曹府医案。可门第与功名会重新筛选文字，许多不合时宜的提醒被删去，许多民间经验被轻看。书活了下来，却又被锁住。",
    glyph: "wall",
  },
  burn_ending: {
    id: "burn_ending",
    name: "青囊焚尽",
    rank: "遗憾焚绝",
    rankColor: "#b23a2c",
    epitaph: "火光保住了秘密，也烧断了去路。",
    body: "你点燃残卷。竹简在火里卷曲、发黑、化灰。无人能借它作恶，也无人能据它救人。华佗没有责怪你，只望着窗外很久。此后千年，人们只记得那本应当存在的书。",
    glyph: "fire",
  },
};

export function resolveEnding(state: GameState): EndingId {
  const highCount = Object.values(state.gameResults ?? {}).filter(r => r.best === "high").length;

  if (state.finalChoice === "chenbo" && state.chenbo_trust >= 1 && highCount >= 2) return "chenbo_true";
  if (state.finalChoice === "chenbo") return "xuanyin_fallback";
  if (state.finalChoice === "xuanyin") return "xuanyin_fallback";
  if (state.finalChoice === "wangji") return "wangji_trap";
  if (state.finalChoice === "burn") return "burn_ending";
  return "xuanyin_fallback";
}

import type { Ending, EndingId, GameState } from "../../types";

export const ENDINGS: Record<string, Ending> = {
  chenbo_true: {
    id: "chenbo_true",
    name: "医者人间",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "药方入市井，医术在人间",
    body: "你把残卷托给陈伯。\n药方没有被锁进高阁，而是在街巷之间一遍遍誊写、背诵、校正。\n许多内容终会散失，可有些救急法门活进乡民的手里。\n很多年后，没人说得清那些方子从何而来，只知道在孩子高热、老人喘咳、行人受伤时，总有人能先做对第一步。\n华佗闭眼前，终于听见牢外有人仍在问药。",
    glyph: "shoots",
  },
  chenbo_fallback: {
    id: "chenbo_fallback",
    name: "残卷余音",
    rank: "遗憾半修",
    rankColor: "#8f7846",
    epitaph: "药签未成卷，余法入人声",
    body: "你把残卷托给陈伯。\n他凭一双老手救下不少急症，也把能记住的法子讲给街坊。\n可药签残缺，记录太少，许多病机只能靠口耳相传。\n青囊没有彻底断绝，却只能留下零散余音。",
    glyph: "shoots",
  },
  xuanyin_true: {
    id: "xuanyin_true",
    name: "残卷余音",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "歌行渡口，禁录同行",
    body: "你把残卷托给玄音。\n她把难懂的医理改作歌诀，带向乐坊、渡口与山门。\n后世未必能得到全卷，却能从曲调里记住该救什么、又该避开什么。\n有些句子在流传中变形，有些禁忌被谨慎保留下来。\n残术不再完整，但没有完全失声。",
    glyph: "living",
  },
  xuanyin_fallback: {
    id: "xuanyin_fallback",
    name: "残卷余音",
    rank: "遗憾半修",
    rankColor: "#8f7846",
    epitaph: "歌声走远，错句难清",
    body: "你把残卷托给玄音。\n歌诀比竹简走得更远，也比竹简更难追回。\n有些救急法门留在曲调里，有些错句也混入人群。\n玄音一路校正，仍无法保证每个渡口唱出的都是原意。\n青囊没有完全失声，却留下了长久的遗憾。",
    glyph: "wall",
  },
  wangji_trap: {
    id: "wangji_trap",
    name: "重锁深阁",
    rank: "遗憾未竟",
    rankColor: "#6e1f18",
    epitaph: "良方锁侯府，黎庶无缘观",
    body: "你把残卷托给王济。\n他确有能力保下一部分内容，也确实让它进入曹府医案。\n可门第与功名会重新筛选文字，许多不合时宜的提醒被删去，许多民间经验被轻看。\n书活了下来，却又被锁住。\n多年以后，有人从府库残页中读见华佗之名，却再难听见街市上的咳声与哭声。",
    glyph: "wall",
  },
  burn_ending: {
    id: "burn_ending",
    name: "青囊焚尽",
    rank: "遗憾焚绝",
    rankColor: "#b23a2c",
    epitaph: "烈焰吞竹简，仙术失传人",
    body: "你点燃残卷。\n竹简在火里卷曲、发黑、化灰。\n无人能借它作恶，也无人能据它救人。\n华佗没有责怪你，只望着窗外很久。\n此后千年，人们只记得那本应当存在的书。",
    glyph: "fire",
  },
};

const RANK_WEIGHT: Record<string, number> = { low: 0, mid: 1, high: 2 };

function rankOf(state: GameState, id: string): string | undefined {
  return state.gameResults?.[id]?.best;
}

function isAtLeastMid(state: GameState, id: string): boolean {
  return RANK_WEIGHT[rankOf(state, id) ?? ""] >= 1;
}

function isHigh(state: GameState, id: string): boolean {
  return rankOf(state, id) === "high";
}

function hasItem(state: GameState, item: string): boolean {
  return state.items.includes(item);
}

function searchPressure(state: GameState): number {
  let pressure = state.searchPressure || 0;
  if (state.ch2 === "show_fragment") pressure += 1;
  if (state.ch3 === "over_search") pressure += 1;
  if (state.ch4 === "spread_then_fix" && !isAtLeastMid(state, "song_formula")) pressure += 1;
  if (state.boxCompartment === "missed") pressure += 1;
  return pressure;
}

export function resolveEnding(state: GameState): EndingId {
  const highCount = Object.values(state.gameResults ?? {}).filter(r => r.best === "high").length;
  const caseTriageOk = isAtLeastMid(state, "case_triage") && state.ch3 !== "tamper_case";
  const completePrescription = isHigh(state, "herb_memory") || hasItem(state, "chenbo_prescription_full");
  const completeSongPage = isHigh(state, "song_formula") || hasItem(state, "xuanyin_song_page_complete");
  const hasForbiddenRecord = hasItem(state, "forbidden_record") || state.ch4 === "keep_forbidden_record";
  const weakEvidenceCount = ["herb_memory", "case_triage", "song_formula"].filter(id => !isAtLeastMid(state, id)).length;

  if (state.finalChoice === "burn" || searchPressure(state) >= 4 || weakEvidenceCount >= 3) {
    return "burn_ending";
  }

  switch (state.finalChoice) {
    case "chenbo":
      return state.chenbo_trust >= 2 &&
        completePrescription &&
        highCount >= 2 &&
        caseTriageOk &&
        (state.record_tendency || 0) >= 1
        ? "chenbo_true"
        : "chenbo_fallback";
    case "xuanyin":
      return completeSongPage && hasForbiddenRecord && state.ch4 !== "spread_then_fix"
        ? "xuanyin_true"
        : "xuanyin_fallback";
    case "wangji":
      return "wangji_trap";
    default:
      return "xuanyin_fallback";
  }
}

const WANGJI_BODY_LOW = "你把残卷托给王济。\n他接住了它，也立刻把它交进更深的门里。\n曹府医官抄录了几条可用浅方，正本却再未离开府库。\n阿吉后来听人说，残页确实活了下来，只是寻常百姓再也摸不到它。";

const WANGJI_BODY_STABLE = "你把残卷托给王济。\n完整病案和假文书让他保下一部分内容，也让曹府不得不承认华佗之名。\n可制度会重新筛选文字，民间经验被轻看，危险提醒被删改。\n书活了下来，却又被锁住。";

function isStableWangjiEnding(state: GameState): boolean {
  return (state.wangji_trust ?? 0) >= 2 && isHigh(state, "case_triage") && (state.system_tendency || 0) >= 1;
}

export const ENDING_NARRATION_BODIES: Record<string, string> = {
  chenbo_true: ENDINGS.chenbo_true.body,
  chenbo_fallback: ENDINGS.chenbo_fallback.body,
  xuanyin_true: ENDINGS.xuanyin_true.body,
  xuanyin_fallback: ENDINGS.xuanyin_fallback.body,
  wangji_trap_low: WANGJI_BODY_LOW,
  wangji_trap_stable: WANGJI_BODY_STABLE,
  burn_ending: ENDINGS.burn_ending.body,
};

export function getEndingAudioId(state: GameState, endId: EndingId): string {
  if (endId === "wangji_trap") {
    return isStableWangjiEnding(state) ? "wangji_trap_stable" : "wangji_trap_low";
  }
  return endId;
}

export function getEndingBody(state: GameState, endId: EndingId): string {
  if (endId === "wangji_trap") {
    if (isStableWangjiEnding(state)) {
      return WANGJI_BODY_STABLE;
    }
    return WANGJI_BODY_LOW;
  }
  return ENDINGS[endId]?.body ?? "";
}

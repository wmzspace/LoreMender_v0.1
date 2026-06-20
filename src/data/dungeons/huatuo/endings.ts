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
  wangji_archive: {
    id: "wangji_archive",
    name: "医案存世",
    rank: "典故修补",
    rankColor: "#2c6657",
    epitaph: "医案藏府库，济世写卷首",
    body: "你把残卷托给王济。\n他把「医术当以济世为先，不以权势为序」写在医案首页，督促曹府医官照录、照用。\n它没有流入街巷，却在府库里被一代代医官翻阅、引证、补全。\n书被锁着，钥匙却交到了愿意开柜的人手里。",
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
  // 注意：ch2 show_fragment、ch3 over_search、woodenBox 藏匿失败(boxCompartment=missed)
  // 以及各小游戏低完成度，都已在「游玩时」直接累加进 state.searchPressure，这里不可重复计入。
  // 仅补上「歌诀边传边改、且纠错不足」这一未在游玩时即时累加的来源。
  let pressure = state.searchPressure || 0;
  if (state.ch4 === "spread_then_fix" && !isAtLeastMid(state, "song_formula")) pressure += 1;
  return pressure;
}

export function resolveEnding(state: GameState): EndingId {
  const highCount = Object.values(state.gameResults ?? {}).filter(r => r.best === "high").length;
  // 病案排对（未按身份）= case_triage 至少中评；按身份排错则 case_triage 偏低
  const correctTriage = isAtLeastMid(state, "case_triage");
  const tampered = state.ch3 === "tamper_case";
  const completePrescription = isHigh(state, "herb_memory") || hasItem(state, "chenbo_prescription_full");
  const completeCaseRecord = isHigh(state, "case_triage") || hasItem(state, "case_record_full");
  const completeSongPage = isHigh(state, "song_formula") || hasItem(state, "xuanyin_song_page_complete");
  const hasForbiddenRecord = hasItem(state, "forbidden_record") || state.ch4 === "keep_forbidden_record";
  const weakEvidenceCount = ["herb_memory", "case_triage", "song_formula"].filter(id => !isAtLeastMid(state, id)).length;
  const sp = searchPressure(state);
  const burnLean = (state.burn_tendency || 0) >= 1;

  // 3. 软化强制焚尽：主动焚毁 / 三路证据全无 / 被围（压力极高，或倾向焚毁且压力偏高）
  if (state.finalChoice === "burn") return "burn_ending";
  if (weakEvidenceCount >= 3) return "burn_ending";
  if (sp >= 5 || (burnLean && sp >= 3)) return "burn_ending";

  // 1. 三线对称：真结局统一需要「信任≥2 + 该线质量物品完整 + 高完成≥2 + 对应倾向≥1 + 线路专属条件」
  //    注：信任为累加值(小游戏高分+1，再加章内 1~2 个共情对白)，故达标需「小游戏高分 + 至少一次共情」。
  switch (state.finalChoice) {
    case "chenbo":
      return state.chenbo_trust >= 2 && completePrescription && highCount >= 2 && correctTriage && (state.record_tendency || 0) >= 1
        ? "chenbo_true"
        : "chenbo_fallback";
    case "xuanyin":
      // 2. 启用 spread_tendency；边传边改(spread_then_fix)无法进真结局
      return completeSongPage && hasForbiddenRecord && highCount >= 2 && (state.spread_tendency || 0) >= 1 && state.ch4 !== "spread_then_fix"
        ? "xuanyin_true"
        : "xuanyin_fallback";
    case "wangji":
      // 4. 偷改病案 / 按身份排序（病案排错）→ 强制重锁深阁
      if (tampered || !correctTriage) return "wangji_trap";
      // 1. 王济对称化：达标 → 医案存世（积极），否则 → 重锁深阁
      return state.wangji_trust >= 2 && completeCaseRecord && highCount >= 2 && (state.system_tendency || 0) >= 1
        ? "wangji_archive"
        : "wangji_trap";
    default:
      return "xuanyin_fallback";
  }
}

export const ENDING_NARRATION_BODIES: Record<string, string> = {
  chenbo_true: ENDINGS.chenbo_true.body,
  chenbo_fallback: ENDINGS.chenbo_fallback.body,
  xuanyin_true: ENDINGS.xuanyin_true.body,
  xuanyin_fallback: ENDINGS.xuanyin_fallback.body,
  wangji_archive: ENDINGS.wangji_archive.body,
  wangji_trap: ENDINGS.wangji_trap.body,
  burn_ending: ENDINGS.burn_ending.body,
};

export function getEndingAudioId(_state: GameState, endId: EndingId): string {
  return endId;
}

export function getEndingBody(_state: GameState, endId: EndingId): string {
  return ENDINGS[endId]?.body ?? "";
}

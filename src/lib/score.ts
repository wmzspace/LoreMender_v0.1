import { STORY } from "../data";
import type { GameResultRank, GameState } from "../data/types";

const RANK_WEIGHT: Record<GameResultRank, number> = { low: 0, mid: 1, high: 2 };

function allGameNodes() {
  return Object.values(STORY).flatMap(ch =>
    ch.beats.flatMap(beat => ("game" in beat ? [beat.game] : []))
  );
}

/** 含探索场景的章节号列表（目前 ch1~ch4 各一处），供探索得分统计用。 */
function explorableChapters(): number[] {
  return Object.entries(STORY)
    .filter(([, chapter]) => chapter.beats.some(b => "explore" in b))
    .map(([key]) => Number(key.replace("ch", "")));
}

export interface ScoreBreakdown {
  label: string;
  score: number;
  max: number;
  detail?: string;
}

export interface ScoreResult {
  total: number;
  maxTotal: number;
  pct: number;
  grade: string;
  gradeColor: string;
  breakdown: ScoreBreakdown[];
}

export function calcScore(state: GameState): ScoreResult {
  const games = allGameNodes();

  const gameScore = games.reduce((sum, g) => {
    const r = state.gameResults?.[g.id];
    return sum + (r?.completed ? RANK_WEIGHT[r.best] : 0);
  }, 0);
  const gameMax = games.length * 2;
  const gamesDone = games.filter(g => state.gameResults?.[g.id]?.completed).length;

  // 信任/医术为累加值(小游戏±1 + 共情对白±1)；每项对总评的贡献封顶 2，低分会扣分。
  const cap2 = (n: number | undefined) => Math.min(Number(n || 0), 2);
  const trustScore =
    cap2(state.chenbo_trust) +
    cap2(state.wangji_trust) +
    cap2(state.xuanyin_trust) +
    cap2(state.medical_skill) +
    cap2(state.asked_heart) +
    cap2(state.record_tendency) +
    cap2(state.system_tendency) +
    cap2(state.spread_tendency);
  const trustMax = 16; // 5 项技能 ×2 + 3 项倾向 ×2

  const CHOICE_SCORE: Record<string, Record<string, number>> = {
    ch2: { record_network: 3, oral_only: 2, show_fragment: 1 },
    ch3: { patient_first: 3, over_search: 2, tamper_case: 1 },
    ch4: { keep_forbidden_record: 3, spread_then_fix: 2, destroy_wrong_song: 1 },
  };
  const choiceMax = 9;
  const choiceScore =
    (CHOICE_SCORE.ch2[state.ch2 ?? ""] ?? 0) +
    (CHOICE_SCORE.ch3[state.ch3 ?? ""] ?? 0) +
    (CHOICE_SCORE.ch4[state.ch4 ?? ""] ?? 0);

  const finalMap: Record<string, number> = { chenbo: 3, xuanyin: 2, wangji: 1, burn: 0 };
  const finalScore = state.finalChoice ? (finalMap[state.finalChoice] ?? 0) : 0;
  const finalMax = 3;

  // 探索得分：每章看完全部热点 +3，点「跳过」+0（不扣分，最低 0 分）；计入总评，但不参与 resolveEnding 判定。
  const exploreChapters = explorableChapters();
  const EXPLORE_FULL_SCORE = 3;
  const exploreMax = exploreChapters.length * EXPLORE_FULL_SCORE;
  let exploreFullCount = 0;
  let exploreSkippedCount = 0;
  const exploreScore = exploreChapters.reduce((sum, chNum) => {
    const r = state.exploreLog?.[chNum];
    if (r === "full") { exploreFullCount++; return sum + EXPLORE_FULL_SCORE; }
    if (r === "skipped") { exploreSkippedCount++; return sum; }
    return sum;
  }, 0);

  const pressurePenalty = Math.min(state.searchPressure || 0, 4);
  const total = Math.max(0, gameScore + trustScore + choiceScore + finalScore + exploreScore - pressurePenalty);
  const maxTotal = gameMax + trustMax + choiceMax + finalMax + exploreMax;
  const pct = Math.round((total / maxTotal) * 100);

  const grade =
    pct >= 80 ? "精通·全解锁" :
    pct >= 60 ? "熟练·深度探索" :
    pct >= 40 ? "入门·初步涉猎" :
    "初试·尚有遗漏";

  const gradeColor =
    pct >= 80 ? "#2c6657" :
    pct >= 60 ? "#5fa892" :
    pct >= 40 ? "#8f7846" :
    "#6e1f18";

  return {
    total,
    maxTotal,
    pct,
    grade,
    gradeColor,
    breakdown: [
      { label: "医术修习", score: gameScore, max: gameMax, detail: `${gamesDone}/${games.length} 关` },
      { label: "证据与信任", score: trustScore, max: trustMax },
      { label: "过程判断", score: choiceScore, max: choiceMax },
      { label: "最终抉择", score: finalScore, max: finalMax },
      { label: "追索压力", score: -pressurePenalty, max: 0, detail: `${state.searchPressure || 0} 点` },
      {
        label: "场景探索", score: exploreScore, max: exploreMax,
        detail: `全探索${exploreFullCount}·跳过${exploreSkippedCount}`,
      },
    ],
  };
}

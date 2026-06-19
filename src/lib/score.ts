import { STORY } from "../data";
import type { GameResultRank, GameState } from "../data/types";

const RANK_WEIGHT: Record<GameResultRank, number> = { low: 0, mid: 1, high: 2 };

function allGameNodes() {
  return Object.values(STORY).flatMap(ch =>
    ch.beats.flatMap(beat => ("game" in beat ? [beat.game] : []))
  );
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

  const trustScore =
    (state.chenbo_trust || 0) +
    (state.wangji_trust || 0) +
    (state.xuanyin_trust || 0) +
    (state.medical_skill || 0) +
    (state.asked_heart || 0) +
    Math.min(state.record_tendency || 0, 2) +
    Math.min(state.system_tendency || 0, 2) +
    Math.min(state.spread_tendency || 0, 2);
  const trustMax = 16;

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

  const pressurePenalty = Math.min(state.searchPressure || 0, 4);
  const total = Math.max(0, gameScore + trustScore + choiceScore + finalScore - pressurePenalty);
  const maxTotal = gameMax + trustMax + choiceMax + finalMax;
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
    ],
  };
}

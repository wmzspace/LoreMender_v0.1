/** 统一数据导出入口 */
export * from "./types";

// 华佗·青囊残卷 副本数据
export {
  STORY,
  CHAPTERS,
  CHARACTERS,
  TRUST_OPTIONS,
  CLUES,
  ENDINGS,
  resolveEnding,
} from "./dungeons/huatuo";

export {
  LEVEL_ASSET_PLANS,
  AI_WORKFLOW_RECORDS,
} from "./competition";
export type {
  AssetStatus,
  LevelAssetPlan,
  AiWorkflowRecord,
} from "./competition";

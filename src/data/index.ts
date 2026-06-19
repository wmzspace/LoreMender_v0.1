/** 统一数据导出入口 */
export * from "./types";

// 华佗·青囊残卷 副本数据
export {
  STORY,
  CHAPTERS,
  CHARACTERS,
  TRUST_OPTIONS,
  CLUES,
  ITEMS,
  ITEM_NAME_TO_ID,
  parseGainedItemIds,
  ENDINGS,
  ENDING_NARRATION_BODIES,
  resolveEnding,
  getEndingBody,
  getEndingAudioId,
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
export type { ItemDef } from "./dungeons/huatuo";

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
  CLUE_NAME_TO_ID,
  parseGainedItemIds,
  parseGainedClueIds,
  ENDINGS,
  ENDING_NARRATION_BODIES,
  ENDING_VIDEOS,
  ENDING_IMAGES,
  resolveEnding,
  getEndingBody,
  getEndingAudioId,
  searchPressure,
} from "./dungeons/huatuo";

export {
  LEVEL_ASSET_PLANS,
  AI_WORKFLOW_RECORDS,
  TEAM_NAME,
  TEAM_MEMBERS,
  AI_PIPELINE_INTRO,
  AI_PIPELINE,
} from "./competition";
export type {
  AssetStatus,
  LevelAssetPlan,
  AiWorkflowRecord,
  AiPipelineStep,
} from "./competition";
export type { ItemDef } from "./dungeons/huatuo";

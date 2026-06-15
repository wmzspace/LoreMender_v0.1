/**
 * 华佗·青囊残卷 副本 —— 配音音色方案（基于 edge-tts，免费微软神经网络语音）
 * 由 tools/tts-generate/generate-huatuo-audio.ts 读取，批量生成 public/audio/levels/1/dialogue/ 下的语音文件。
 */

export interface VoiceSetting {
  /** edge-tts 音色名，如 zh-CN-YunjianNeural */
  voice: string;
  /** 语速调整，如 "-15%"，省略表示默认语速 */
  rate?: string;
  /** 音调调整，如 "-8Hz"，省略表示默认音调 */
  pitch?: string;
}

/** 旁白音色 */
export const NARRATION_VOICE: VoiceSetting = {
  voice: "zh-CN-XiaoxiaoNeural", rate: "-3%", pitch: "-18Hz",
};

/** 各角色音色，key 为 characters.ts 中的 Character id */
export const CHARACTER_VOICES: Record<string, VoiceSetting> = {
  aj: { voice: "zh-CN-YunxiNeural", rate: "-20%", pitch: "-10Hz" },       // 阿吉 · 主角
  huatuo: { voice: "zh-CN-YunjianNeural", pitch: "-5Hz" },                // 华佗 · 沉稳老医者
  caocao: { voice: "zh-CN-YunyangNeural", rate: "-8%", pitch: "-15Hz" },  // 曹操 · 威压
  wangji: { voice: "zh-CN-YunyangNeural" },                               // 王济 · 油滑门客
  chenbo: { voice: "zh-CN-YunjianNeural", rate: "-15%" },                 // 陈伯 · 朴实乡野郎中
  xuanyin: { voice: "zh-CN-YunjianNeural", rate: "-25%", pitch: "-12Hz" }, // 玄音道人 · 得道高人
  soldier: { voice: "zh-CN-YunxiaNeural" },                               // 士卒 · 龙套
};

/**
 * 批量生成「华佗·青囊残卷」副本第一~五章的旁白/对白语音（edge-tts，免费）
 *
 * 用法：
 *   npx tsx tools/tts-generate/generate-huatuo-audio.ts          # 仅生成缺失的文件
 *   npx tsx tools/tts-generate/generate-huatuo-audio.ts --force  # 全部重新生成
 *
 * 依赖：本机需安装 edge-tts（pip install edge-tts）。
 * 若 edge-tts 不在 PATH 中，可通过环境变量 EDGE_TTS_BIN 指定可执行文件路径。
 *
 * 音色方案见 src/data/dungeons/huatuo/voices.ts。
 * 输出文件：public/audio/levels/1/dialogue/<chapterId>/<beatIndex>.mp3
 *   beatIndex 为该 beat 在 STORY[chapterId].beats 数组中的下标，方便运行时按下标直接定位音频。
 */
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { STORY } from "../../src/data/dungeons/huatuo/story";
import { ENDINGS } from "../../src/data/dungeons/huatuo/endings";
import { NARRATION_VOICE, CHARACTER_VOICES, type VoiceSetting } from "../../src/data/dungeons/huatuo/voices";
import { buildAudioIndex } from "../../src/data/dungeons/huatuo/audioIndex";
import type { Beat } from "../../src/data/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_ROOT = path.join(PROJECT_ROOT, "public/audio/levels/1/dialogue");

const EDGE_TTS_BIN = process.env.EDGE_TTS_BIN || "edge-tts";
const FORCE = process.argv.includes("--force");

function lineOf(beat: Beat): { line: string; speaker?: string; isNarration: boolean } | null {
  if (!("line" in beat)) return null;
  if ("narration" in beat && beat.narration) return { line: beat.line, isNarration: true };
  if ("speaker" in beat) return { line: beat.line, speaker: beat.speaker, isNarration: false };
  return null;
}

let generated = 0, skipped = 0, missing = 0;
const failed: string[] = [];

const MAX_RETRY = 3;

/** 用指定音色合成一段文本到 out；edge-tts 偶发 NoAudioReceived，故带重试。 */
function synth(setting: VoiceSetting, line: string, label: string, out: string) {
  // 已存在且非空才跳过；0 字节多为上次中断的残留，需重新生成
  if (fs.existsSync(out) && fs.statSync(out).size > 0 && !FORCE) {
    skipped++;
    return;
  }
  const args = ["--voice", setting.voice];
  if (setting.rate) args.push(`--rate=${setting.rate}`);
  if (setting.pitch) args.push(`--pitch=${setting.pitch}`);
  if (setting.volume) args.push(`--volume=${setting.volume}`);
  args.push("--text", line, "--write-media", out);

  console.log(`[生成] ${label} -> ${path.relative(PROJECT_ROOT, out)}`);
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      execFileSync(EDGE_TTS_BIN, args, { stdio: "inherit" });
      // 校验确实写出了非空音频
      if (!fs.existsSync(out) || fs.statSync(out).size === 0) {
        throw new Error("输出为空");
      }
      generated++;
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
      if (attempt < MAX_RETRY) {
        console.warn(`  ↻ 第 ${attempt} 次失败(${msg})，重试…`);
      } else {
        console.error(`  ✗ ${label} 连续 ${MAX_RETRY} 次失败：${msg}`);
        try { if (fs.existsSync(out)) fs.unlinkSync(out); } catch { /* ignore */ }
        failed.push(`${label} (${path.relative(PROJECT_ROOT, out)})`);
      }
    }
  }
}

for (const [chapterId, chapter] of Object.entries(STORY)) {
  const dir = path.join(OUTPUT_ROOT, chapterId);
  fs.mkdirSync(dir, { recursive: true });

  // 稳定下标：全量 DFS（含所有 ifKey 分支），与运行时 StoryPage 共用同一编号。
  for (const [beat, index] of buildAudioIndex(chapter.beats)) {
    const info = lineOf(beat);
    if (!info) continue;

    const setting = info.isNarration ? NARRATION_VOICE : CHARACTER_VOICES[info.speaker!];
    if (!setting) {
      console.warn(`[跳过] ${chapterId}#${index}：speaker "${info.speaker}" 没有配音方案`);
      missing++;
      continue;
    }

    const label = `${chapterId}#${index} (${info.isNarration ? "旁白" : info.speaker})`;
    synth(setting, info.line, label, path.join(dir, `${index}.mp3`));
  }
}

// ── 结局旁白：读取 ENDINGS[id].body，旁白音色合成 ──────────────
// 注：wangji_trap 有高/低信任两版正文，此处统一用默认（高信任）body 配音。
const ENDINGS_DIR = path.join(OUTPUT_ROOT, "endings");
fs.mkdirSync(ENDINGS_DIR, { recursive: true });
for (const [endId, ending] of Object.entries(ENDINGS)) {
  if (!ending.body) continue;
  synth(NARRATION_VOICE, ending.body, `结局·${ending.name}`, path.join(ENDINGS_DIR, `${endId}.mp3`));
}

console.log(`\n完成：生成 ${generated}，跳过(已存在) ${skipped}，缺失音色映射 ${missing}，失败 ${failed.length}`);
if (failed.length) {
  console.log("失败列表（可重跑脚本仅补这些）：");
  failed.forEach((f) => console.log("  - " + f));
  process.exit(1);
}

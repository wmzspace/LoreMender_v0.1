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
import { NARRATION_VOICE, CHARACTER_VOICES } from "../../src/data/dungeons/huatuo/voices";
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

for (const [chapterId, chapter] of Object.entries(STORY)) {
  const dir = path.join(OUTPUT_ROOT, chapterId);
  fs.mkdirSync(dir, { recursive: true });

  chapter.beats.forEach((beat, index) => {
    const info = lineOf(beat);
    if (!info) return;

    const setting = info.isNarration ? NARRATION_VOICE : CHARACTER_VOICES[info.speaker!];
    if (!setting) {
      console.warn(`[跳过] ${chapterId}#${index}：speaker "${info.speaker}" 没有配音方案`);
      missing++;
      return;
    }

    const out = path.join(dir, `${index}.mp3`);
    if (fs.existsSync(out) && !FORCE) {
      skipped++;
      return;
    }

    const args = ["--voice", setting.voice];
    if (setting.rate) args.push(`--rate=${setting.rate}`);
    if (setting.pitch) args.push(`--pitch=${setting.pitch}`);
    args.push("--text", info.line, "--write-media", out);

    const label = info.isNarration ? "旁白" : info.speaker;
    console.log(`[生成] ${chapterId}#${index} (${label}) -> ${path.relative(PROJECT_ROOT, out)}`);
    execFileSync(EDGE_TTS_BIN, args, { stdio: "inherit" });
    generated++;
  });
}

console.log(`\n完成：生成 ${generated}，跳过(已存在) ${skipped}，缺失音色映射 ${missing}`);

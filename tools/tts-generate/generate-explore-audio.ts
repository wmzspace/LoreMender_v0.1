/**
 * 批量生成「可交互探索」热点对白的语音（edge-tts，免费）
 *
 * 主脚本 generate-huatuo-audio.ts 用 buildAudioIndex，而 buildAudioIndex 不会进入
 * explore beat，故探索热点里的对白没有被生成。本脚本专门补这部分。
 *
 * 用法：
 *   npx tsx tools/tts-generate/generate-explore-audio.ts          # 仅生成缺失
 *   npx tsx tools/tts-generate/generate-explore-audio.ts --force  # 全部重生成
 *
 * 输出：public/audio/levels/1/dialogue/<chapterId>/explore/<hotspotId>_<subIndex>.mp3
 *   subIndex 为该句在 hotspot.beats 中的下标，运行时 StoryPage 按此定位。
 */
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { STORY } from "../../src/data/dungeons/huatuo/story";
import { NARRATION_VOICE, CHARACTER_VOICES, type VoiceSetting } from "../../src/data/dungeons/huatuo/voices";
import type { Beat, ExploreScene } from "../../src/data/types";

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

/** 递归收集一章里的所有 explore 场景（含 ifKey 分支）。 */
function collectExplore(beats: Beat[], out: ExploreScene[]) {
  for (const beat of beats) {
    if ("ifKey" in beat) collectExplore(beat.beats, out);
    else if ("explore" in beat) out.push(beat.explore);
  }
}

let generated = 0, skipped = 0, missing = 0;
const failed: string[] = [];
const MAX_RETRY = 3;

function synth(setting: VoiceSetting, line: string, label: string, out: string) {
  if (fs.existsSync(out) && fs.statSync(out).size > 0 && !FORCE) { skipped++; return; }
  const args = ["--voice", setting.voice];
  if (setting.rate) args.push(`--rate=${setting.rate}`);
  if (setting.pitch) args.push(`--pitch=${setting.pitch}`);
  if (setting.volume) args.push(`--volume=${setting.volume}`);
  args.push("--text", line, "--write-media", out);
  console.log(`[生成] ${label} -> ${path.relative(PROJECT_ROOT, out)}`);
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      execFileSync(EDGE_TTS_BIN, args, { stdio: "inherit" });
      if (!fs.existsSync(out) || fs.statSync(out).size === 0) throw new Error("输出为空");
      generated++;
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
      if (attempt < MAX_RETRY) console.warn(`  ↻ 第 ${attempt} 次失败(${msg})，重试…`);
      else {
        console.error(`  ✗ ${label} 连续 ${MAX_RETRY} 次失败：${msg}`);
        try { if (fs.existsSync(out)) fs.unlinkSync(out); } catch { /* ignore */ }
        failed.push(`${label} (${path.relative(PROJECT_ROOT, out)})`);
      }
    }
  }
}

for (const [chapterId, chapter] of Object.entries(STORY)) {
  const scenes: ExploreScene[] = [];
  collectExplore(chapter.beats, scenes);
  if (scenes.length === 0) continue;
  if (scenes.length > 1) {
    console.warn(`[警告] ${chapterId} 含 ${scenes.length} 个 explore 场景，hotspot id 须全局唯一才不冲突`);
  }
  const dir = path.join(OUTPUT_ROOT, chapterId, "explore");
  fs.mkdirSync(dir, { recursive: true });

  for (const scene of scenes) {
    for (const hotspot of scene.hotspots) {
      hotspot.beats.forEach((beat, i) => {
        const info = lineOf(beat);
        if (!info) return;
        const setting = info.isNarration ? NARRATION_VOICE : CHARACTER_VOICES[info.speaker!];
        if (!setting) {
          console.warn(`[跳过] ${chapterId}/explore/${hotspot.id}_${i}：speaker "${info.speaker}" 无音色`);
          missing++;
          return;
        }
        const label = `${chapterId}/explore/${hotspot.id}_${i} (${info.isNarration ? "旁白" : info.speaker})`;
        synth(setting, info.line, label, path.join(dir, `${hotspot.id}_${i}.mp3`));
      });
    }
  }
}

console.log(`\n完成：生成 ${generated}，跳过 ${skipped}，缺失音色 ${missing}，失败 ${failed.length}`);
if (failed.length) {
  console.log("失败列表：");
  failed.forEach((f) => console.log("  - " + f));
  process.exit(1);
}

/**
 * Offline dialogue generator for the Huatuo dungeon.
 *
 * Uses the local Windows SAPI voice (Microsoft Huihui Desktop) and writes WAV files:
 *   public/audio/levels/1/dialogue/ch<N>/<stableIndex>.wav
 *   public/audio/levels/1/dialogue/endings/<endingAudioId>.wav
 *
 * It sends no story text to external services. The generated audio is intentionally
 * simple; replace these WAVs later with final studio/AI voice files if desired.
 */
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { STORY, ENDING_NARRATION_BODIES } from "../../src/data/dungeons/huatuo";
import { buildAudioIndex } from "../../src/data/dungeons/huatuo/audioIndex";
import type { Beat } from "../../src/data/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_ROOT = path.join(PROJECT_ROOT, "public/audio/levels/1/dialogue");
const FORCE = process.argv.includes("--force");
const VOICE_NAME = process.env.SAPI_VOICE || "Microsoft Huihui Desktop";

type LineInfo = { line: string; speaker?: string; isNarration: boolean };
type SapiSetting = { rate: number; volume: number };

const NARRATION_SETTING: SapiSetting = { rate: -1, volume: 92 };
const SPEAKER_SETTINGS: Record<string, SapiSetting> = {
  aj: { rate: 0, volume: 94 },
  huatuo: { rate: -2, volume: 88 },
  chenbo: { rate: -1, volume: 94 },
  wangji: { rate: 0, volume: 96 },
  xuanyin: { rate: -1, volume: 94 },
  caocao: { rate: -2, volume: 100 },
  soldier: { rate: 1, volume: 100 },
  guard: { rate: 1, volume: 100 },
  clerk: { rate: 1, volume: 96 },
  woman: { rate: 1, volume: 98 },
  child: { rate: 2, volume: 96 },
  passerby: { rate: 1, volume: 94 },
  tea_guest: { rate: 0, volume: 94 },
  busker: { rate: 2, volume: 96 },
  patrol: { rate: 2, volume: 100 },
};

function lineOf(beat: Beat): LineInfo | null {
  if (!("line" in beat)) return null;
  if ("narration" in beat && beat.narration) return { line: beat.line, isNarration: true };
  if ("speaker" in beat) return { line: beat.line, speaker: beat.speaker, isNarration: false };
  return null;
}

function toBase64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function synth(setting: SapiSetting, line: string, label: string, out: string) {
  if (fs.existsSync(out) && fs.statSync(out).size > 0 && !FORCE) {
    skipped++;
    return;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ps = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$voiceName = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${toBase64(VOICE_NAME)}'))
$text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${toBase64(line)}'))
$out = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${toBase64(out)}'))
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice($voiceName)
$synth.Rate = ${setting.rate}
$synth.Volume = ${setting.volume}
$synth.SetOutputToWaveFile($out)
$synth.Speak($text) | Out-Null
$synth.SetOutputToNull()
$synth.Dispose()
`;
  const encoded = Buffer.from(ps, "utf16le").toString("base64");
  console.log(`[生成] ${label} -> ${path.relative(PROJECT_ROOT, out)}`);
  execFileSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded], {
    stdio: "inherit",
  });
  generated++;
}

let generated = 0;
let skipped = 0;
let missing = 0;

for (const [chapterId, chapter] of Object.entries(STORY)) {
  const dir = path.join(OUTPUT_ROOT, chapterId);
  fs.mkdirSync(dir, { recursive: true });

  for (const [beat, index] of buildAudioIndex(chapter.beats)) {
    const info = lineOf(beat);
    if (!info) continue;
    const setting = info.isNarration ? NARRATION_SETTING : SPEAKER_SETTINGS[info.speaker!];
    if (!setting) {
      console.warn(`[跳过] ${chapterId}#${index}：speaker "${info.speaker}" 没有离线配音方案`);
      missing++;
      continue;
    }
    synth(setting, info.line, `${chapterId}#${index} (${info.isNarration ? "旁白" : info.speaker})`, path.join(dir, `${index}.wav`));
  }
}

const endingsDir = path.join(OUTPUT_ROOT, "endings");
fs.mkdirSync(endingsDir, { recursive: true });
for (const [audioId, body] of Object.entries(ENDING_NARRATION_BODIES)) {
  synth(NARRATION_SETTING, body, `结局·${audioId}`, path.join(endingsDir, `${audioId}.wav`));
}

console.log(`\n完成：生成 ${generated}，跳过 ${skipped}，缺失音色映射 ${missing}`);
if (missing > 0) process.exit(1);

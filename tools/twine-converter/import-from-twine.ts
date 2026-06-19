/**
 * 导入脚本：将编辑后的 Twine HTML 转换回 TypeScript 格式
 * 用法：npm run story:import <twine-html-file>
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'node-html-parser';
import { fileURLToPath } from 'url';

// ES 模块中获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const STORY_OUTPUT_PATH = path.join(PROJECT_ROOT, 'src/data/story.ts');

interface TwinePassage {
  name: string;
  content: string;
  tags: string[];
  position: { x: number; y: number };
}

/**
 * 解析 Twine HTML 文件
 */
function parseTwineHTML(htmlPath: string): TwinePassage[] {
  console.log(`📖 读取 Twine 文件：${htmlPath}`);
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const root = parse(html);
  
  const storyData = root.querySelector('tw-storydata');
  if (!storyData) {
    throw new Error('无法找到 tw-storydata 节点，请确认这是一个有效的 Twine HTML 文件');
  }

  const passages: TwinePassage[] = [];
  const passageNodes = storyData.querySelectorAll('tw-passagedata');

  passageNodes.forEach(node => {
    const name = node.getAttribute('name') || '';
    const tags = (node.getAttribute('tags') || '').split(' ').filter(Boolean);
    const position = node.getAttribute('position') || '0,0';
    const [x, y] = position.split(',').map(Number);
    const content = node.textContent || '';

    passages.push({
      name,
      content: content.trim(),
      tags,
      position: { x, y },
    });
  });

  console.log(`✅ 解析完成，共 ${passages.length} 个节点\n`);
  return passages;
}

/**
 * 解析 Twine 内容为 Beat 对象
 */
function parsePassageContent(content: string): any[] {
  const beats: any[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

  let currentBeat: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 解析对话：**[角色]**
    if (line.startsWith('**[') && line.includes(']**')) {
      const speaker = line.match(/\*\*\[(.+?)\]\*\*/)?.[1];
      const dialogueLine = lines[i + 1] || '';
      
      if (speaker) {
        beats.push({
          speaker: speaker,
          line: dialogueLine,
        });
        i++; // 跳过下一行（对话内容）
      }
      continue;
    }

    // 解析旁白：//旁白//
    if (line.startsWith('//') && line.endsWith('//')) {
      const narration = line.slice(2, -2);
      const nextLine = lines[i + 1] || '';
      beats.push({
        narration: true,
        line: nextLine || narration,
      });
      if (nextLine) i++;
      continue;
    }

    // 解析选择：* [[选项|目标]]
    if (line.startsWith('* [[')) {
      if (!currentBeat || !currentBeat.choices) {
        currentBeat = { choices: [] };
        beats.push(currentBeat);
      }

      const match = line.match(/\* \[\[(.+?)\|(.+?)\]\]/);
      if (match) {
        const [, label, target] = match;
        currentBeat.choices.push({
          label: label.trim(),
          // target 信息暂时保留，后续通过分析节点内容补充 toast/set
        });
      }
      continue;
    } else {
      currentBeat = null;
    }

    // 解析跳转：[[继续 →|目标]]
    const linkMatch = line.match(/\[\[.+?\|(.+?)\]\]/);
    if (linkMatch) {
      const target = linkMatch[1];
      if (target.startsWith('ch')) {
        beats.push({ gotoChapter: target });
      } else if (target === 'trust_page') {
        beats.push({ gotoTrust: true });
      } else if (target === 'ending_resolver') {
        beats.push({ gotoEnding: true });
      }
    }
  }

  return beats;
}

/**
 * 将 Passage 转换为章节数据
 */
function passagesToStory(passages: TwinePassage[]): Record<string, any> {
  const story: Record<string, any> = {};

  // 筛选章节节点
  const chapterPassages = passages.filter(p => 
    p.name.startsWith('ch') && !p.name.includes('_choice_')
  );

  chapterPassages.forEach(passage => {
    const chapterId = passage.name;
    const titleMatch = passage.content.match(/^# (.+)/);
    const title = titleMatch ? titleMatch[1] : `章节 ${chapterId}`;

    // 解析场景类型（简化处理）
    let scene = 'clinic_night';
    if (chapterId === 'ch1') scene = 'clinic_night';
    else if (chapterId === 'ch2') scene = 'raid_coming';
    else if (chapterId === 'ch3') scene = 'find_trust';
    else if (chapterId === 'ch4') scene = 'final_choice';

    const beats = parsePassageContent(passage.content);

    story[chapterId] = {
      scene,
      title,
      beats,
    };
  });

  return story;
}

/**
 * 生成 TypeScript 代码
 */
function generateTypeScriptCode(story: Record<string, any>): string {
  let code = `import type { StoryChapter } from "./types";\n\n`;
  code += `export const STORY: Record<string, StoryChapter> = {\n`;

  Object.entries(story).forEach(([chapterId, chapter], index) => {
    code += `  ${chapterId}: {\n`;
    code += `    scene: "${chapter.scene}",\n`;
    code += `    title: "${chapter.title}",\n`;
    code += `    beats: [\n`;

    chapter.beats.forEach((beat: any) => {
      if (beat.narration) {
        code += `      { narration: true, line: "${beat.line.replace(/"/g, '\\"')}" },\n`;
      } else if (beat.speaker) {
        code += `      { speaker: "${beat.speaker}", line: "${beat.line.replace(/"/g, '\\"')}" },\n`;
      } else if (beat.choices) {
        code += `      {\n        choices: [\n`;
        beat.choices.forEach((choice: any) => {
          code += `          { label: "${choice.label.replace(/"/g, '\\"')}"`;
          if (choice.toast) code += `, toast: "${choice.toast.replace(/"/g, '\\"')}"`;
          if (choice.set) {
            code += `, set: { `;
            Object.entries(choice.set).forEach(([k, v]) => {
              code += `${k}: "${v}", `;
            });
            code += `}`;
          }
          if (choice.ending) code += `, ending: "${choice.ending}"`;
          code += ` },\n`;
        });
        code += `        ],\n      },\n`;
      } else if (beat.gotoChapter) {
        code += `      { gotoChapter: "${beat.gotoChapter}" },\n`;
      } else if (beat.gotoTrust) {
        code += `      { gotoTrust: true },\n`;
      } else if (beat.gotoEnding) {
        code += `      { gotoEnding: true },\n`;
      }
    });

    code += `    ],\n`;
    code += `  },\n`;
  });

  code += `};\n`;
  return code;
}

/**
 * 主导入函数
 */
async function importFromTwine(twineHtmlPath: string) {
  console.log('🔄 开始导入 Twine 文件...\n');

  // 解析 Twine HTML
  const passages = parseTwineHTML(twineHtmlPath);

  // 转换为故事数据
  const story = passagesToStory(passages);

  console.log('📝 生成 TypeScript 代码...');
  const tsCode = generateTypeScriptCode(story);

  // 备份原文件
  if (fs.existsSync(STORY_OUTPUT_PATH)) {
    const backupPath = STORY_OUTPUT_PATH.replace('.ts', `.backup.${Date.now()}.ts`);
    fs.copyFileSync(STORY_OUTPUT_PATH, backupPath);
    console.log(`💾 已备份原文件：${backupPath}`);
  }

  // 写入新文件
  fs.writeFileSync(STORY_OUTPUT_PATH, tsCode, 'utf-8');

  console.log(`✅ 导入完成！`);
  console.log(`📁 输出文件：${STORY_OUTPUT_PATH}`);
  console.log('\n⚠️  注意：');
  console.log('1. 请检查生成的代码是否正确');
  console.log('2. 某些复杂逻辑可能需要手动调整');
  console.log('3. 建议运行 npm run dev 测试游戏\n');
}

// 命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 请提供 Twine HTML 文件路径');
  console.error('用法：npm run story:import <path-to-twine-html>');
  process.exit(1);
}

const twineHtmlPath = path.resolve(args[0]);
if (!fs.existsSync(twineHtmlPath)) {
  console.error(`❌ 文件不存在：${twineHtmlPath}`);
  process.exit(1);
}

// 运行导入
importFromTwine(twineHtmlPath).catch(console.error);

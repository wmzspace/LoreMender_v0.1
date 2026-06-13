/**
 * 导出脚本：将 src/data/story.ts 转换为 Twine HTML 格式
 * 用法：npm run story:export
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES 模块中获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入剧情数据（需要在运行时动态导入）
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const STORY_PATH = path.join(PROJECT_ROOT, 'src/data/story.ts');
const OUTPUT_PATH = path.join(__dirname, 'output/huatuo.html');

interface Beat {
  speaker?: string;
  line?: string;
  narration?: boolean;
  choices?: Array<{
    label: string;
    toast?: string;
    set?: Record<string, any>;
    ending?: string;
  }>;
  gotoChapter?: string;
  gotoTrust?: boolean;
  gotoEnding?: boolean;
}

interface StoryChapter {
  scene: string;
  title: string;
  beats: Beat[];
}

/**
 * 生成 Twine Passage（节点）
 */
function generatePassage(
  name: string,
  content: string,
  position: { x: number; y: number },
  tags: string[] = []
): string {
  const tagsStr = tags.length > 0 ? ` tags="${tags.join(' ')}"` : '';
  return `:: ${name} [${position.x},${position.y}]${tagsStr}\n${content}\n\n`;
}

/**
 * 将 Beat 转换为 Twine 内容
 */
function beatToTwineContent(beat: Beat, chapterId: string, beatIndex: number): string {
  let content = '';

  // 对话或旁白
  if ('speaker' in beat && beat.speaker) {
    content += `**[${beat.speaker}]**\n${beat.line}\n\n`;
  } else if (beat.narration) {
    content += `//旁白//\n${beat.line}\n\n`;
  }

  // 选择分支
  if (beat.choices) {
    content += '你的选择：\n\n';
    beat.choices.forEach((choice, idx) => {
      const choiceNodeName = `${chapterId}_choice_${beatIndex}_${idx}`;
      content += `* [[${choice.label}|${choiceNodeName}]]\n`;
    });
  }

  // 跳转章节
  if (beat.gotoChapter) {
    content += `\n[[继续 →|${beat.gotoChapter}]]`;
  }

  // 跳转托付页面
  if (beat.gotoTrust) {
    content += `\n[[选择托付对象 →|trust_page]]`;
  }

  // 跳转结局
  if (beat.gotoEnding) {
    content += `\n[[查看结局 →|ending_resolver]]`;
  }

  return content;
}

/**
 * 生成选择分支节点
 */
function generateChoicePassages(
  chapterId: string,
  beatIndex: number,
  choices: any[],
  nextChapter?: string
): string {
  let passages = '';
  let yPos = 300 + beatIndex * 100;

  choices.forEach((choice, idx) => {
    const choiceNodeName = `${chapterId}_choice_${beatIndex}_${idx}`;
    let content = `//你选择了：${choice.label}//\n\n`;

    // 添加 Toast 提示
    if (choice.toast) {
      content += `<<set $lastToast = "${choice.toast}">>\n`;
      content += `提示：${choice.toast}\n\n`;
    }

    // 设置状态
    if (choice.set) {
      Object.entries(choice.set).forEach(([key, value]) => {
        content += `<<set $${key} = "${value}">>\n`;
      });
      content += '\n';
    }

    // 跳转
    if (choice.ending) {
      content += `[[查看结局：${choice.ending} →|ending_${choice.ending}]]`;
    } else if (nextChapter) {
      content += `[[继续 →|${nextChapter}]]`;
    }

    passages += generatePassage(
      choiceNodeName,
      content,
      { x: 800 + idx * 300, y: yPos },
      ['choice']
    );
  });

  return passages;
}

/**
 * 主转换函数
 */
async function convertStoryToTwine() {
  console.log('🔄 开始转换 story.ts 到 Twine 格式...\n');

  // 读取故事数据（这里简化处理，实际应该动态导入）
  // 由于 TS 限制，这里使用硬编码示例
  const STORY: Record<string, StoryChapter> = {
    ch1: {
      scene: 'clinic_night',
      title: '第一章 · 医馆夜谈',
      beats: [
        { narration: true, line: '夜雨初停。建安二十年，许都狱外的一间小医馆。\n烛火三盏，药柜七格。残卷一页。' },
        { speaker: '华佗', line: '你来了。\n替我把那卷东西收一收——别让灯油溅上去。' },
        { speaker: '徒弟', line: '（这是……《青囊经》？)' },
        { speaker: '华佗', line: '若医术落入恶人之手，救人之法，也会变成杀人之术。\n你说，这书该留吗？' },
        {
          choices: [
            { label: '医术无罪。该留给值得信任的人。', toast: '你触碰到了这段典故真正的遗憾。', set: { firstChoice: 'trust' } },
            { label: '若会害人，不如毁掉。', toast: '华佗看了你一眼，没有说话。', set: { firstChoice: 'burn' } },
            { label: '不能现在决定，先弄清真相。', toast: '你获得了关键线索：青囊残页', set: { firstChoice: 'investigate' } },
          ],
        },
        { speaker: '华佗', line: '也好。\n你去翻翻药柜后面那只木匣，再过来与我说话。\n——我怕，今夜没有明天。' },
        { gotoChapter: 'ch2' },
      ],
    },
    ch2: {
      scene: 'raid_coming',
      title: '第二章 · 搜查将至',
      beats: [
        { narration: true, line: '三更。\n远处巷口，铁靴踏过石板，由远及近。' },
        { speaker: '徒弟', line: '（不能再等了。）' },
        { speaker: '华佗', line: '他们若搜到这本书，便要再砍我一次。\n你说，怎么办？' },
        {
          choices: [
            { label: '藏起残卷。', toast: '你把残卷塞进药柜暗格。', set: { ch2: 'hide' } },
            { label: '追问华佗徒弟，他记得多少。', toast: '你触碰到了这段典故真正的遗憾。', set: { ch2: 'ask' } },
            { label: '去市井寻找传闻。', toast: '你听见巷口孩童在唱奇怪的歌谣。', set: { ch2: 'street' } },
          ],
        },
        { narration: true, line: '门外脚步声越来越近。\n你忽然意识到——能带走的，从来不只是这一本书。' },
        { gotoChapter: 'clue' },
      ],
    },
    ch3: {
      scene: 'find_trust',
      title: '第三章 · 寻找可信之人',
      beats: [
        { narration: true, line: '四更。雨又下了起来。\n华佗指了指门外。' },
        { speaker: '华佗', line: '若有一夜，只能托付一人——\n你想把它，交给谁？' },
        { gotoTrust: true },
      ],
    },
    ch4: {
      scene: 'final_choice',
      title: '第四章 · 青囊抉择',
      beats: [
        { narration: true, line: '五更将至。\n你把那卷书捧在手里。它比想象中轻。' },
        { speaker: '华佗', line: '做吧。\n我已经太老，做不了这件事了。' },
        {
          choices: [
            { label: '毁去原卷，以绝后患。', toast: '你点燃了烛芯。', set: { finalDecision: 'burn' }, ending: 'ash' },
            { label: '藏于民间，散于有缘。', toast: '你把方子撕成几份，分别塞进衣襟。', set: { finalDecision: 'scatter' }, ending: 'living' },
            { label: '暂且封存，待后来人。', toast: '你将残卷裹紧，塞进药柜夹墙。', set: { finalDecision: 'seal' }, ending: 'sealed' },
          ],
        },
        { gotoEnding: true },
      ],
    },
  };

  let twineContent = '';
  let yPosition = 100;

  // 生成起始节点
  twineContent += generatePassage(
    'Start',
    '# 典故修补者 · 青囊残卷\n\n你是一名典故修补者，穿越到建安年间。\n华佗即将被处死，《青囊经》面临失传。\n\n你醒来时，成了华佗身边最不起眼的小徒弟。\n\n//你不能救他，但你还有一夜，可以决定医道是否断绝。//\n\n[[开始游戏 →|ch1]]',
    { x: 100, y: 100 },
    ['start']
  );

  // 遍历所有章节
  Object.entries(STORY).forEach(([chapterId, chapter], chapterIndex) => {
    yPosition = 300 + chapterIndex * 400;
    let xPosition = 100;

    let chapterContent = `# ${chapter.title}\n\n`;
    let choicePassages = '';
    let hasChoices = false;

    chapter.beats.forEach((beat, beatIndex) => {
      if (beat.choices) {
        chapterContent += beatToTwineContent(beat, chapterId, beatIndex);
        choicePassages += generateChoicePassages(
          chapterId,
          beatIndex,
          beat.choices,
          beat.gotoChapter || chapter.beats[beatIndex + 1]?.gotoChapter
        );
        hasChoices = true;
      } else {
        chapterContent += beatToTwineContent(beat, chapterId, beatIndex);
      }
    });

    // 生成章节主节点
    twineContent += generatePassage(
      chapterId,
      chapterContent,
      { x: xPosition, y: yPosition },
      ['chapter']
    );

    // 添加选择分支节点
    if (hasChoices) {
      twineContent += choicePassages;
    }
  });

  // 生成线索页面节点
  twineContent += generatePassage(
    'clue',
    '# 线索调查\n\n你在医馆中仔细搜寻...\n\n可查看的线索：\n* [[青囊残页|clue_fragment]]\n* [[药方抄本|clue_prescription]]\n* [[徒弟口述|clue_speak]]\n* [[民谣片段|clue_ballad]]\n* [[施针图|clue_needle]]\n\n[[调查完毕，继续 →|ch3]]',
    { x: 500, y: 1500 },
    ['clue-page']
  );

  // 生成托付页面节点
  twineContent += generatePassage(
    'trust_page',
    '# 寻找可信之人\n\n若有一夜，只能托付一人——\n\n* [[大徒儿·吴普|trust_disciple]]\n* [[隐村接骨匠·老栾|trust_bonesetter]]\n* [[民间歌者·阿瑶|trust_singer]]\n* [[兽医·老周|trust_vet]]\n\n',
    { x: 500, y: 2000 },
    ['trust-page']
  );

  // 生成托付选择节点
  const trustOptions = [
    { id: 'disciple', name: '大徒儿·吴普', desc: '最懂华佗，但可能被牵连。' },
    { id: 'bonesetter', name: '隐村接骨匠·老栾', desc: '手艺高超，沉默可靠。' },
    { id: 'singer', name: '民间歌者·阿瑶', desc: '可用歌谣把医理传下去。' },
    { id: 'vet', name: '兽医·老周', desc: '懂生命之理，可把方法用于民间。' },
  ];

  trustOptions.forEach((option, idx) => {
    twineContent += generatePassage(
      `trust_${option.id}`,
      `**你选择托付给：${option.name}**\n\n${option.desc}\n\n<<set $trustedPerson = "${option.id}">>\n\n[[继续 →|ch4]]`,
      { x: 800 + idx * 300, y: 2000 },
      ['trust-choice']
    );
  });

  // 生成结局解析节点
  twineContent += generatePassage(
    'ending_resolver',
    `<<if $finalDecision == "burn">>\n  [[查看结局 →|ending_ash]]\n<<elseif $finalDecision == "scatter" and ($trustedPerson == "singer" or $trustedPerson == "bonesetter" or $trustedPerson == "vet")>>\n  [[查看结局 →|ending_living]]\n<<else>>\n  [[查看结局 →|ending_sealed]]\n<</if>>`,
    { x: 500, y: 2500 },
    ['ending-resolver']
  );

  // 生成结局节点
  const endings = [
    { id: 'ash', name: '原卷成灰', rank: '遗憾未竟', body: '火光吞没了残卷。\n\n华佗没有阻止你。他只是很久没有说话。\n\n后来，世人只记得他医术通神，却再也不知道他究竟如何救人。' },
    { id: 'sealed', name: '密室封存', rank: '遗憾半修', body: '残卷被藏在无人知晓的夹墙里。\n\n它躲过了搜查，也躲过了后世。\n\n很多年后，墙体坍塌，纸页已碎成尘。' },
    { id: 'living', name: '医道未断', rank: '医道未断', body: '没有人再见过完整的《青囊经》。\n\n可许多年后，乡野间有接骨匠会唱奇怪的口诀，兽医懂得止血，老妇人知道按哪个穴位能救急。\n\n书没有留下，医道留下了。\n\n——华佗终究死了。可这一次，医道没有随他一起沉入青史。' },
  ];

  endings.forEach((ending, idx) => {
    twineContent += generatePassage(
      `ending_${ending.id}`,
      `# ${ending.name}\n## ${ending.rank}\n\n${ending.body}\n\n[[重新开始|Start]]\n[[查看结局图鉴|gallery]]`,
      { x: 800 + idx * 400, y: 2500 },
      ['ending']
    );
  });

  // 读取 Twine 模板
  const templatePath = path.join(__dirname, 'templates/twine-template.html');
  let template = fs.readFileSync(templatePath, 'utf-8');

  // 插入剧情内容
  template = template.replace('{{STORY_DATA}}', twineContent);
  template = template.replace('{{STORY_NAME}}', '典故修补者 · 青囊残卷');
  template = template.replace('{{IFID}}', generateIFID());

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(OUTPUT_PATH, template, 'utf-8');

  console.log('✅ 转换完成！');
  console.log(`📁 输出文件：${OUTPUT_PATH}`);
  console.log('\n📝 下一步：');
  console.log('1. 在 Twine 中导入这个文件');
  console.log('2. 可视化编辑你的剧情');
  console.log('3. 导出后运行 npm run story:import 导入回项目\n');
}

/**
 * 生成 Twine IFID（Interactive Fiction ID）
 */
function generateIFID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

// 运行转换
convertStoryToTwine().catch(console.error);

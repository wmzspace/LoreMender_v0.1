export type AssetStatus = "planned" | "generated" | "integrated";

export interface LevelAssetPlan {
  chapter: number;
  title: string;
  goal: string;
  imagePath: string;
  videoPath: string;
  bgmPath: string;
  imagePrompt: string;
  videoPrompt: string;
  bgmPrompt: string;
  status: AssetStatus;
}

export interface AiWorkflowRecord {
  title: string;
  tool: string;
  output: string;
  evidence: string;
}

export const LEVEL_ASSET_PLANS: LevelAssetPlan[] = [
  {
    chapter: 1,
    title: "牢狱初醒",
    goal: "建立玩家身份，认识华佗，明确青囊残卷危机。",
    imagePath: "/images/levels/level01_prison.png",
    videoPath: "/videos/intro_prison.mp4",
    bgmPath: "/audio/bgm/prison_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: ancient Xuchang prison at night, candlelight, damp stone wall, scattered bamboo slips. Subject: an elderly healer silhouette assembling bamboo scrolls, a young apprentice waking nearby. Style/medium: 2D hand-painted Chinese historical fantasy game background, ink wash texture, subtle gold particles. Composition/framing: cinematic 16:9, clear focal candle and scroll, usable center for game UI. Lighting/mood: warm candle against deep blue-black prison shadow, quiet tension. Constraints: no text, no watermark, no UI.",
    videoPrompt: "Camera slowly pushes into an ancient prison cell, candlelight flickers, bamboo slips glow with golden ink, ink dust floating in the air, Chinese historical fantasy, no text, no watermark, 6-10 seconds.",
    bgmPrompt: "Ancient prison night, guqin, low strings, soft wind, candle crackle, restrained tension, loopable instrumental, no vocals, 60 seconds.",
    status: "planned",
  },
  {
    chapter: 2,
    title: "三人之试",
    goal: "调查三位托付对象，让玩家理解知识流传的不同风险。",
    imagePath: "/images/levels/level02_three_people.png",
    videoPath: "/videos/intro_three_people.mp4",
    bgmPath: "/audio/bgm/investigation_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: late Han dynasty street, herbal smoke, distant military gate and misty mountain trail blended as symbolic layers. Subject: three candidate silhouettes: a camp official, a village healer, a mountain Taoist. Style/medium: 2D hand-painted Chinese historical fantasy, paper texture, ink wash accents. Composition/framing: wide 16:9 triptych-like composition, three readable silhouettes. Lighting/mood: morning haze, investigative, uncertain. Constraints: no text, no watermark, no UI.",
    videoPrompt: "Three silhouettes appear one by one across a historical street, herbal smoke and mountain mist blend together, golden ink lines connect them to one bamboo scroll, no text, no watermark, 6-10 seconds.",
    bgmPrompt: "Investigation mood, bamboo flute, light wooden percussion, guqin plucks, thoughtful and restrained, loopable instrumental, no vocals, 60 seconds.",
    status: "planned",
  },
  {
    chapter: 3,
    title: "曹府密谈",
    goal: "制造权力压迫感，让玩家面对交书换命的诱惑。",
    imagePath: "/images/levels/level03_cao_mansion.png",
    videoPath: "/videos/intro_cao_mansion.mp4",
    bgmPath: "/audio/bgm/power_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: Cao Cao's lacquered hall under bronze lamps, dark desk, bamboo scroll on the table. Subject: oppressive ruler silhouette above a small apprentice figure. Style/medium: cinematic 2D Chinese historical fantasy concept art, ink wash and lacquer texture. Composition/framing: 16:9 low-angle hall composition, strong perspective toward the desk. Lighting/mood: bronze lamp glow, political pressure, suspense. Constraints: no text, no watermark, no UI.",
    videoPrompt: "A lacquered hall opens under bronze lamps, a bamboo scroll lies on a dark desk, shadows stretch like pressure around a small apprentice, no text, no watermark, 6-10 seconds.",
    bgmPrompt: "Political pressure, low drums, dark bowed strings, sparse guqin, tense but elegant Chinese historical suspense, loopable instrumental, no vocals, 60 seconds.",
    status: "planned",
  },
  {
    chapter: 4,
    title: "青囊抉择",
    goal: "让玩家做出唯一绑定决策：托付、封存、误托或焚毁。",
    imagePath: "/images/levels/level04_choice.png",
    videoPath: "/videos/intro_choice.mp4",
    bgmPath: "/audio/bgm/choice_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: prison cell at deep night, last candle, bamboo scroll fragment on a rough table. Subject: four faint fate reflections on the scroll: village medicine, mountain archive, locked private library, rising flame. Style/medium: 2D hand-painted Chinese fantasy, ink wash, gold dust. Composition/framing: 16:9 close cinematic composition, scroll as focal point. Lighting/mood: emotional final decision, warm candle and cold shadow. Constraints: no text, no watermark, no UI.",
    videoPrompt: "A scroll rests between candle flame and shadow, four possible fates ripple across it: village light, mountain mist, locked archive, fire ash, no text, no watermark, 6-10 seconds.",
    bgmPrompt: "Final decision, sparse guqin, heartbeat-like muted percussion, low flute, emotional and tense, loopable instrumental, no vocals, 60 seconds.",
    status: "planned",
  },
  {
    chapter: 5,
    title: "千年回响",
    goal: "总结修补意义，把玩家选择转化为文化价值表达。",
    imagePath: "/images/levels/level05_echo.png",
    videoPath: "/videos/intro_echo.mp4",
    bgmPath: "/audio/bgm/echo_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: golden ink rising from a bamboo fragment and spreading across villages, clinics, mountains and books over a thousand years. Subject: medicine lights carried by ordinary people, faint healer silhouette in the background. Style/medium: 2D hand-painted Chinese historical fantasy, ink wash, delicate paper texture, luminous gold particles. Composition/framing: wide 16:9 finale composition with upward motion. Lighting/mood: emotional resolution, warm dawn, hopeful. Constraints: no text, no watermark, no UI.",
    videoPrompt: "Golden ink rises from a fragment, transforms into medicine lights across villages over a thousand years, dawn light opens through paper texture, no text, no watermark, 6-10 seconds.",
    bgmPrompt: "Finale theme, guqin, xiao flute, soft strings, bell shimmer, emotional resolution, hopeful but restrained, loopable instrumental, no vocals, 75 seconds.",
    status: "planned",
  },
];

export const AI_WORKFLOW_RECORDS: AiWorkflowRecord[] = [
  {
    title: "剧情结构",
    tool: "CodeBuddy / Codex",
    output: "把华佗副本整理成五章可玩流程，并补上“千年回响”终章。",
    evidence: "docs/ai_dialogue_history.md 记录 1-2",
  },
  {
    title: "代码协作",
    tool: "CodeBuddy / Codex",
    output: "修正 ch4 到 ch5 的跳转、结局图鉴映射、进度页解锁逻辑，并新增参赛说明页面。",
    evidence: "src/data/dungeons/huatuo/story.ts、src/pages/ShowcasePage.tsx",
  },
  {
    title: "插图生成",
    tool: "比赛指定 AI 绘图工具",
    output: "按五章分别生成封面级场景图，替换 public/images/levels/*.png。",
    evidence: "docs/asset_generation_log.md 与生成截图",
  },
  {
    title: "视频生成",
    tool: "比赛指定 AI 视频工具",
    output: "生成五段 6-10 秒章节过场，放入 public/videos/。",
    evidence: "docs/asset_generation_log.md 与视频文件",
  },
  {
    title: "BGM 生成",
    tool: "比赛指定 AI 音乐工具",
    output: "生成封面、五章和结局可循环 BGM，放入 public/audio/bgm/。",
    evidence: "docs/asset_generation_log.md 与音频文件",
  },
];


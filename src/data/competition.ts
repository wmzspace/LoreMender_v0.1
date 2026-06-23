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

export interface AiPipelineStep {
  index: string;
  title: string;
  detail: string;
}

/** 参赛队伍。 */
export const TEAM_NAME = "拾遗小分队";
export const TEAM_MEMBERS = ["吴勉孜", "谭阳芊", "宋其燃"];

/** AI 使用说明：全程以 CodeBuddy 为核心，串联四大创作环节。 */
export const AI_PIPELINE_INTRO = "全程以 CodeBuddy 为核心 AI 工具，串联各创作环节：";
export const AI_PIPELINE: AiPipelineStep[] = [
  {
    index: "①",
    title: "世界观与剧情",
    detail: "CodeBuddy 将华佗典故扩写为五章可玩剧情、七条结局分支与评分逻辑。",
  },
  {
    index: "②",
    title: "游戏原画",
    detail: "CodeBuddy 写美术提示词并驱动 ChatGPT 出图，生成 130+ 张分镜插画压成 WebP；结局视频由 Gemini 生成。",
  },
  {
    index: "③",
    title: "游戏安全体系",
    detail: "CodeBuddy 生成存档数据交互校验层，载入时对状态字段做类型校验。",
  },
  {
    index: "④",
    title: "声音表演",
    detail: "CodeBuddy 编排配音与配乐，对白由 TTS 批量生成、循环 BGM 由 Gemini 按章节情绪产出并自动映射播放。",
  },
];

export const LEVEL_ASSET_PLANS: LevelAssetPlan[] = [
  {
    chapter: 1,
    title: "许昌大牢",
    goal: "探索牢房、拼合青囊残页（拼竹简）、解开木盒机关，补全药童路引后以送药童身份离开大牢。",
    imagePath: "/images/levels/1/chapters/ch1_beats/bamboo_table.webp",
    videoPath: "（无独立过场视频，章首用标题卡转场承接）",
    bgmPath: "/audio/levels/1/bgm/prison_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: ancient Xuchang prison at night, candlelight, damp stone wall, scattered bamboo slips, three sorting buckets on a wooden table. Subject: bamboo slips ready to be classified by symptom, theory and prescription. Style/medium: 2D hand-painted Chinese historical fantasy game background, ink wash texture, subtle gold particles. Composition/framing: cinematic 16:9, table-top close-up usable as minigame board. Lighting/mood: warm candle against deep blue-black prison shadow, quiet tension. Constraints: no text, no watermark, no UI.",
    videoPrompt: "（本章未生成过场视频，已用章节标题卡 + 多张分镖插画承接叙事节奏）",
    bgmPrompt: "Ancient prison night, guqin, low strings, soft wind, candle crackle, restrained tension, loopable instrumental, no vocals, 60 seconds.",
    status: "integrated",
  },
  {
    chapter: 2,
    title: "许昌街市",
    goal: "在街市急症中检查线索、配药救人（配药救急小游戏），验证民间经验能否被整理成可传的药签。",
    imagePath: "/images/levels/1/chapters/ch2_beats/scene_01_market_chaos.webp",
    videoPath: "（无独立过场视频，章首用标题卡转场承接）",
    bgmPath: "/audio/levels/1/bgm/investigation_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: late Han dynasty street market in chaos, a woman holding a feverish child, herbal stall nearby. Subject: aji crouching to examine the child, market crowd as background blur. Style/medium: 2D hand-painted Chinese historical fantasy, paper texture, ink wash accents. Composition/framing: wide 16:9, clear foreground focus on the sick child. Lighting/mood: morning haze, urgent but grounded. Constraints: no text, no watermark, no UI.",
    videoPrompt: "（本章未生成过场视频，已用章节标题卡 + 多张分镖插画承接叙事节奏）",
    bgmPrompt: "Investigation mood, bamboo flute, light wooden percussion, guqin plucks, thoughtful and restrained, loopable instrumental, no vocals, 60 seconds.",
    status: "integrated",
  },
  {
    chapter: 3,
    title: "曹府档案区",
    goal: "主动潜入曹府查案，按病情而非身份重排病案（病案排序小游戏），取得问诊录与假文书。",
    imagePath: "/images/levels/1/chapters/ch3_beats/ch3_01_gate.webp",
    videoPath: "（无独立过场视频，章首用标题卡转场承接）",
    bgmPath: "/audio/levels/1/bgm/power_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: Cao mansion's pharmacy archive hall under bronze lamps, rows of case files and bamboo scrolls. Subject: a small apprentice silhouette slipping past a clerk to reach the archive. Style/medium: cinematic 2D Chinese historical fantasy concept art, ink wash and lacquer texture. Composition/framing: 16:9 low-angle hall composition, strong perspective toward the archive shelves. Lighting/mood: bronze lamp glow, political pressure, suspense. Constraints: no text, no watermark, no UI.",
    videoPrompt: "（本章未生成过场视频，已用章节标题卡 + 多张分镖插画承接叙事节奏）",
    bgmPrompt: "Political pressure, low drums, dark bowed strings, sparse guqin, tense but elegant Chinese historical suspense, loopable instrumental, no vocals, 60 seconds.",
    status: "integrated",
  },
  {
    chapter: 4,
    title: "民间乐坊",
    goal: "追踪错误歌诀的传播链（歌诀纠错小游戏），区分可入歌的救急常识和必须禁传的危险内容。",
    imagePath: "/images/levels/1/chapters/ch4_beats/scene_01_alley_singing.webp",
    videoPath: "（无独立过场视频，章首用标题卡转场承接）",
    bgmPath: "/audio/levels/1/bgm/choice_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: a narrow alley where children sing a folk medicine rhyme, a teahouse guest listening nearby. Subject: aji noticing a dangerously wrong line in the children's chant. Style/medium: 2D hand-painted Chinese fantasy, ink wash, warm dusk tone. Composition/framing: 16:9 street-level composition, children as focal group. Lighting/mood: lively but uneasy, folk warmth mixed with quiet alarm. Constraints: no text, no watermark, no UI.",
    videoPrompt: "（本章未生成过场视频，已用章节标题卡 + 多张分镖插画承接叙事节奏）",
    bgmPrompt: "Final decision, sparse guqin, heartbeat-like muted percussion, low flute, emotional and tense, loopable instrumental, no vocals, 60 seconds.",
    status: "integrated",
  },
  {
    chapter: 5,
    title: "旧祠裁断",
    goal: "把一路获得的证据摆上案台，由过程条件与最终托付共同判定青囊归处（信任抉择 + 七结局分支）。",
    imagePath: "/images/levels/1/chapters/ch5_beats/scene_01_enter_shrine.webp",
    videoPath: "/videos/levels/1/ending_burn.mp4（及另外 3 段结局演出视频，按托付对象与真假线分流）",
    bgmPath: "/audio/levels/1/bgm/echo_loop.mp3",
    imagePrompt: "Use case: stylized-concept. Asset type: game environment concept art. Scene/backdrop: an old ancestral shrine at dusk, relics and evidence laid out on a stone altar. Subject: aji presenting clues to Huatuo's spirit before the final judgment. Style/medium: 2D hand-painted Chinese historical fantasy, ink wash, delicate paper texture, luminous gold particles. Composition/framing: wide 16:9 finale composition, altar as focal point. Lighting/mood: emotional resolution, warm dusk, solemn. Constraints: no text, no watermark, no UI.",
    videoPrompt: "Golden ink rises from a fragment, transforms into medicine lights across villages over a thousand years, dawn light opens through paper texture, no text, no watermark, 6-10 seconds.",
    bgmPrompt: "Finale theme, guqin, xiao flute, soft strings, bell shimmer, emotional resolution, hopeful but restrained, loopable instrumental, no vocals, 75 seconds.",
    status: "integrated",
  },
];

export const AI_WORKFLOW_RECORDS: AiWorkflowRecord[] = [
  {
    title: "剧情与玩法设计",
    tool: "CodeBuddy / Claude Code",
    output: "把华佗副本从单线对话扩展为五章可玩流程，每章绑定一个独立小游戏（拼竹简、木盒机关、配药救急、病案排序、歌诀纠错），并设计七条结局分支与探索评分体系。",
    evidence: "src/data/dungeons/huatuo/story.ts、endings.ts、src/lib/score.ts",
  },
  {
    title: "小游戏交互实现",
    tool: "CodeBuddy / Claude Code",
    output: "实现五个小游戏的拖拽分类、机关解谜、记忆配对、卡片排序、纠错判定等交互逻辑与三档评分反馈。",
    evidence: "src/pages/MiniGamePage.tsx",
  },
  {
    title: "开发者模式 / 调试工具",
    tool: "CodeBuddy / Claude Code",
    output: "新增开发者模式（指定小游戏评级、跳过对话、二次确认弹窗），便于快速复核全部结局分支与评分逻辑。",
    evidence: "src/lib/devMode.ts、src/components/DevSettings.tsx",
  },
  {
    title: "插图生成与压缩",
    tool: "CodeBuddy（写提示词）+ ChatGPT（出图）",
    output: "为五章共生成 130+ 张分镖场景插画（人物、道具、关键画面），并统一压缩为 WebP 格式以控制包体。",
    evidence: "public/images/levels/1/chapters/ch1_beats~ch5_beats/、docs/asset_generation_log.md",
  },
  {
    title: "结局演出视频生成",
    tool: "CodeBuddy（写提示词）+ Gemini（出视频）",
    output: "生成 4 段结局收场视频（含焚卷、陈伯线、王济线、玄音线），按托付对象与真假线动态分流播放。",
    evidence: "public/videos/levels/1/ending_*.mp4",
  },
  {
    title: "BGM 生成",
    tool: "CodeBuddy（写提示词）+ Gemini（出音乐）",
    output: "按章节情绪生成五段可循环 BGM（牢狱、街市调查、权力压迫、抉择、终章回响），由章节号自动映射播放。",
    evidence: "public/audio/levels/1/bgm/、src/lib/audio.ts",
  },
];


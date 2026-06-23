# 典故修补者 · 青囊残卷

**The Lore Mender: The Qingnang Fragment**

> 一个面向 PC 网页端的轻量互动剧情游戏原型 · MVP  
> 穿越典故，修补遗憾

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#🤝-贡献指南)

---

## 📖 项目简介

**典故修补者**是一个 PC 网页端互动叙事游戏原型，主题为东方典故修补。

你是"典故修补者"，能进入被遗忘的典故世界，附身关键人物。你不能随意改写生死，只能在有限身份和有限时间内，修补那些被历史掩埋的遗憾。

### 第一个副本：华佗·青囊残卷

> 建安年间，华佗将死，《青囊经》即将失传。  
> 你醒来时，成了华佗身边最不起眼的小徒弟。  
> **你不能救他，但你还有一夜，可以决定医道是否断绝。**

**游戏时长**：5–10 分钟  
**包含内容**：5 个剧情章节 · 5 条线索 · 3 个可托付人物（+ 毁去残卷）· 4 种结局

---

## 🏆 参赛准备

本仓库已整理腾讯云黑客松 / AI CAN DO IT 方向的提交材料入口：

- [比赛提交说明](./docs/competition_submission.md)：作品定位、五章流程、AI 使用说明、演示视频脚本与提交清单。
- [AI 对话历史](./docs/ai_dialogue_history.md)：按“目标 - 输入 - 输出 - 采纳 - 人工修改”整理的记录模板。
- [AI 素材生成记录](./docs/asset_generation_log.md)：插图、视频、BGM/SFX 的生成提示词与落地路径。
- [五关剧情大纲](./docs/story_5_level_outline.md)：每关剧情目标、玩家动作、文化表达点和素材需求。
- [AI 素材提示词包](./docs/ai_prompt_pack.md)：可直接复制到 AI 绘图、视频、音乐工具中的提示词。

游戏封面新增了 **参赛档案** 入口，用于在 Demo 内展示五关剧情、AI 素材计划和对话历史提交链路。

---

## 🎨 可视化剧情编辑器

### 方式一：应用内编辑器（推荐）

启动 `npm run dev` 后，浏览器访问 **`http://localhost:5173/editor`**：

- **节点图**：以流程图查看/编辑全部剧情（章节 · 旁白 · 对话 · 选择 · 跳转 · 结局），点节点在右侧面板改文案/选项/跳转；可拖拽、缩放、看小地图。
- **代码视图**：直接看/编辑生成的 TypeScript。
- **导出落地**：点「导出」下载 `story.ts`（或「复制」），覆盖到 **`src/data/dungeons/huatuo/story.ts`** 即生效（浏览器不能直接写文件，故为「编辑→导出→替换」半自动流程；导出提示中的旧路径 `src/data/` 请改放到 `dungeons/huatuo/` 子目录）。

### 方式二：Twine 工作流

```bash
npm run story:export                       # 导出到 Twine HTML
npm run story:import <twine-html-file>     # 编辑后导回
```

> ⚠️ 数据迁移到 `src/data/dungeons/huatuo/` 后，转换脚本仍指向旧的 `src/data/story.ts`（现为废弃转发），**该工作流暂不可用**，待脚本路径适配。优先使用应用内编辑器。

参考：[Twine 快速开始](./TWINE_GUIDE.md) · [剧情结构文档](./STORY_STRUCTURE.md)

---

## 🎮 核心玩法

- **剧情选择**：每章关键节点都有 2-3 个选择，塑造氛围并记录状态
- **线索调查**：线索板（底部导航）可收集 5 条线索（青囊残页 / 药方抄本 / 师父口述 / 民谣片段 / 施针图），理解"医道未断"的真意；为可选侧栏，不阻塞主线
- **唯一决策（青囊何归）**：终章决定《青囊经》的归宿——托付于 **王济 / 陈伯 / 玄音道人** 三人之一，或 **毁去残卷**。此选择直接决定结局
- **多重结局**：医者人间（典故修补）/ 残卷余音（遗憾半修）/ 重锁深阁（遗憾未竟）/ 青囊焚尽（遗憾焚绝）
- **结局图鉴**：解锁的结局保存在本地，可重复体验收集全结局

---

## 📁 项目结构

```
LoreMender_v0.1/
├── index.html                  ← Vite 入口 HTML (引入 Google Fonts)
├── package.json                ← npm 依赖与脚本
├── vite.config.ts              ← Vite 配置
├── tsconfig.json               ← TypeScript 配置
├── src/
│   ├── main.tsx                ← React 入口,挂载 #root
│   ├── App.tsx                 ← 主路由 (PageKey 状态机)
│   ├── data/                   ← 剧情/角色/线索/结局数据 (TS)
│   │   ├── types.ts            ← GameState / Beat / Choice 等共享类型
│   │   ├── index.ts            ← 统一导出 (从副本 re-export)
│   │   └── dungeons/huatuo/    ← 华佗·青囊残卷 副本数据
│   │       ├── story.ts        ← STORY (各章 beats)
│   │       ├── chapters.ts     ← CHAPTERS
│   │       ├── characters.ts   ← CHARACTERS + TRUST_OPTIONS
│   │       ├── clues.ts        ← CLUES
│   │       ├── endings.ts      ← ENDINGS + resolveEnding()
│   │       └── index.ts
│   ├── components/             ← 通用 UI 组件 (.tsx)
│   │   │   Toast / Topbar / PageHeader / BottomNav / PaperPanel / SealTag
│   │   │   GoldDivider / DialogueBox / ChoiceList / CharacterCard
│   │   │   BottomSheet / ProgressDots / SceneFrame / LockedDungeon
│   │   └── art/                ← SVG 场景插图 / 角色剪影 / 线索/世界观图标
│   ├── pages/                  ← 9 个页面组件 (.tsx)
│   │   │   CoverPage / WorldPage / ChapterSelectPage / StoryPage
│   │   │   CluePage / TrustRoutePage / ProgressPage / EndingPage / GalleryPage
│   ├── editor/                 ← 可视化剧情编辑器 (/editor 路由,懒加载, @xyflow/react)
│   ├── lib/
│   │   ├── storage.ts          ← loadState/saveState/defaultState + saveBeat/loadBeat
│   │   └── routes.ts           ← PageKey 联合类型
│   └── styles/global.css       ← 古风 UI 样式系统 (CSS 变量 + 交互/无障碍层)
├── public/images/cover.jpg     ← 首页主视觉海报
├── tools/twine-converter/      ← Twine 互转脚本 (story:export / story:import)
├── original/                   ← v0 单文件原型 (仅作存档参考)
├── README.md
└── LICENSE
```

**技术栈**：Vite 8 · React 19 · TypeScript · @xyflow/react（编辑器）· CSS Variables · localStorage

> v0 原型采用 Babel Standalone 在浏览器内编译 JSX,完整源码保留在 [`original/`](./original/) 目录下。

---

## 🚀 快速开始

> 需要 Node.js ≥ 20.19.0 或 ≥ 22.12.0（Vite 8 要求）

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器 (默认 http://localhost:5173)
npm run dev

# 3. 类型检查 + 生产构建
npm run build

# 4. 本地预览构建产物
npm run preview
```

桌面浏览器访问 `http://localhost:5173` 即可全屏体验。

### 部署

构建产物在 `dist/`,纯静态,可直接部署到 Vercel / Netlify / GitHub Pages。

- Vercel / Netlify:自动识别 Vite,Build Command `npm run build`,Output `dist`
- GitHub Pages:推送 `dist/` 到 `gh-pages` 分支(或用 GitHub Actions)

---

## 🎨 设计理念

### 视觉风格

- **色调**：暗金 (#c9a14a) + 墨黑 (#0a0604) + 宣纸米白 (#ebd9b3) + 烛火暖光 (#ffb968)
- **氛围**：古风电影感 · 东方奇谭 · 历史遗憾 · 沉浸式配图
- **元素**：青史空间、残卷、古籍、药柜、医馆、夜雨、烛光、窗棂、卷轴、墨迹、金色流光

### 交互设计

- **桌面优先**：交互按键鼠设计，可使用 hover 等桌面端交互
- **清晰可点**：关键按钮高度 ≥48px，便于鼠标点击
- **轻量反馈**：文字 toast + 剧情分支，**无数值系统**（无好感度/金币/等级/装备）
- **多样化版式**：对话选择 / 人物卡片 / 线索板 / 时间线 / 结局插图 / Bottom Sheet

### 文案风格

短剧钩子 + 古风情绪，避免堆砌辞藻。示例：

> 「你不能救下华佗。青史已经写下他的死。」  
> 「但你还有一夜，可以决定医道是否断绝。」  
> 「书没有留下，医道留下了。」

---

## 🛠️ 开发

### 项目架构

- 路由:`App.tsx` 维护 `PageKey` 状态机,根据当前页渲染对应组件
- 状态:`useState<GameState>` + 自动 `saveState()` 同步到 `localStorage`
- 类型:`src/data/types.ts` 集中定义 `GameState` / `Beat` / `Choice` 等,各页面通过 `in` 类型守卫窄化 `Beat`
- 资源:全部 SVG 内联,无图片依赖;字体来自 Google Fonts

---

## 📊 数据结构

### localStorage 数据

主存档 key：`loremender:huatuo:v2`（自动保存）

```typescript
{
  currentChapter: number,         // 进度 (1-5)
  finalChoice: string | null,     // 青囊何归 的决定 (wangji/chenbo/xuanyin/burn) — 决定结局
  trustedPerson: string | null,   // 托付对象 id (焚书时为空)
  searchedClues: string[],        // 已查看的线索 id
  unlockedEndings: string[],      // 已解锁结局 id (跨周目持久,供图鉴)
  lastEnding: string | null,      // 本周目结局 (重新选择/重置会清空)
  // 章内 flag (记录用,暂不参与结局判定):
  firstImpression / suspect / caoCunning / cao_suspicion / trust_huatuo / found_clue ...
}
```

另有阅读位置键 `loremender:huatuo:beat`（`{c: 章节, i: beat 下标}`），用于离开剧情页后**续读**；换章 / 新开局按章节标记自动归零。

### 剧情数据结构

每个 beat（剧情节拍）可以是：

```typescript
// 对话
{ speaker: "huatuo", line: "这书该留吗？" }

// 旁白
{ narration: true, line: "夜雨初停。建安二十年..." }

// 选择分支
{
  choices: [
    { label: "交给陈伯", toast: "提示文案", set: { finalChoice: "chenbo" } },
    ...
  ]
}

// 跳转
{ gotoChapter: "ch2" }        // 跳转章节
{ gotoTrust: true }           // 跳转「青囊何归」决策页
{ gotoEnding: true }          // 跳转结局
```

结局由 `resolveEnding(state)` 根据 `finalChoice` 推导：
`chenbo→医者人间 · xuanyin→残卷余音 · wangji→重锁深阁 · burn→青囊焚尽`。
`finalChoice` 由「青囊何归」决策页设置（终章唯一绑定决策）。

---

## 🔧 扩展指南

1. 新建副本数据目录 `src/data/dungeons/<name>/`，参照 `huatuo/` 提供 `story.ts` / `chapters.ts` / `characters.ts` / `clues.ts` / `endings.ts` / `index.ts`
2. 必要时在 `src/data/types.ts` 补充类型（如新的 `SceneKind`），并在 `src/data/index.ts` 接入新副本导出
3. 在 `src/components/art/` 下新增 `Scene*.tsx` 并在 `art/index.ts` 导出
4. 在 `src/pages/ChapterSelectPage.tsx` 解锁新副本卡片；在 `src/editor/StoryFlowEditor.tsx` 的 `DUNGEONS` 注册可在编辑器中查看

**示例**:`src/data/dungeons/libai/story.ts`
```ts
export const STORY: Record<string, StoryChapter> = {
  ch1: {
    scene: "palace_night",
    title: "第一章 · 长安月夜",
    beats: [
      { narration: true, line: "天宝三载，长安城..." },
      // ...
    ],
  },
};
```

### 替换美术资源

所有视觉当前用 SVG 绘制,可直接替换为真实图片(放入 `src/assets/` 后通过 ESM import):

```tsx
// src/components/art/SceneClinic.tsx
import clinicUrl from "../../assets/scenes/clinic.png";

export function SceneClinic() {
  return <img src={clinicUrl} style={{width:"100%", height:"100%", objectFit:"cover"}}/>;
}
```

**推荐资源目录**:
```
src/assets/
  cover/          # 封面插图
  scenes/         # 场景背景
  characters/     # 角色立绘
  endings/        # 结局插图
  icons/          # 线索图标
  textures/       # 纹理素材
```

### 自定义样式

所有颜色/字体/间距在 `src/styles/global.css` 中通过 CSS 变量定义:

```css
:root {
  --ink-deepest: #0d0905;
  --gold: #c9a14a;
  --paper: #ebd9b3;
  --candle: #ffb968;
  /* ... */
}
```

修改颜色变量即可全局生效。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献类型

- 🐛 Bug 修复
- ✨ 新副本/新剧情
- 🎨 美术资源（插画/UI/字体）
- 📝 文案优化
- 🌐 多语言支持
- 🔧 代码重构

### 提交规范

```bash
git clone git@github.com:wmzspace/LoreMender_v0.1.git
cd LoreMender_v0.1

# 创建分支
git checkout -b feature/your-feature

# 提交
git add .
git commit -m "feat: 添加李白副本"

# 推送
git push origin feature/your-feature
```

然后在 GitHub 上创建 Pull Request。

**Commit 规范**：
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 样式调整
- `refactor:` 代码重构
- `content:` 剧情/文案更新
- `art:` 美术资源更新

---

## 📝 开发路线图

- [x] MVP 原型（华佗·青囊残卷）
- [x] 迁移至 Vite + TypeScript
- [x] 主视觉海报封面
- [x] 可视化剧情编辑器（应用内 `/editor` + Twine 互转）
- [ ] 适配 Twine 互转脚本到 `dungeons/huatuo/` 新数据路径
- [ ] 第二个副本（李白·谪仙遗恨 / 岳飞·风波未平）
- [ ] AI 生成美术资源替换 SVG 占位
- [ ] 音效 + BGM
- [ ] 动画细节（纸页展开、印章盖落、线索连线）
- [ ] 存档系统（多档位 + 云存档）
- [ ] 成就系统
- [ ] 国际化（英文版）

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 💬 联系方式

- **Issues**：[GitHub Issues](https://github.com/wmzspace/LoreMender_v0.1/issues)
- **讨论**：[GitHub Discussions](https://github.com/wmzspace/LoreMender_v0.1/discussions)

---

<div align="center">

**穿越典故，修补遗憾**

Made with ❤️ by [wmzspace](https://github.com/wmzspace)

</div>

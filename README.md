# 典故修补者 · 青囊残卷

**The Lore Mender: The Qingnang Fragment**

> 一个面向手机端的小程序式轻量互动剧情游戏原型 · MVP  
> 穿越典故，修补遗憾

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#🤝-贡献指南)

---

## 📖 项目简介

**典故修补者**是一个移动端 H5 互动叙事游戏原型，主题为东方典故修补。

你是"典故修补者"，能进入被遗忘的典故世界，附身关键人物。你不能随意改写生死，只能在有限身份和有限时间内，修补那些被历史掩埋的遗憾。

### 第一个副本：华佗·青囊残卷

> 建安年间，华佗将死，《青囊经》即将失传。  
> 你醒来时，成了华佗身边最不起眼的小徒弟。  
> **你不能救他，但你还有一夜，可以决定医道是否断绝。**

**游戏时长**：8–12 分钟  
**包含内容**：5 个章节 · 5 条线索 · 4 个可托付人物 · 3 种结局

---

## 🎨 可视化剧情编辑器

**全新功能**：使用 Twine 可视化编辑剧情！

```bash
# 导出现有剧情到 Twine
npm run story:export

# 在 Twine 中可视化编辑后，导入回项目
npm run story:import <twine-html-file>
```

**优势**：
- ✅ 可视化查看所有分支关系
- ✅ 拖拽节点编辑剧情
- ✅ 实时预览剧情流程
- ✅ 防止遗漏分支

详细指南：[Twine 快速开始](./TWINE_GUIDE.md) | [剧情结构文档](./STORY_STRUCTURE.md)

---

## 🎮 核心玩法

- **剧情选择**：每个关键节点都有 2-3 个选择，影响后续剧情与结局
- **线索调查**：在医馆中收集 5 条线索（残页、药方、口述、民谣、施针图），理解"医道未断"的真意
- **人物托付**：在第三章选择一位可信之人托付《青囊经》（徒弟 / 接骨匠 / 歌者 / 兽医）
- **多重结局**：根据你的抉择进入不同结局（原卷成灰 / 密室封存 / 医道未断）
- **结局图鉴**：解锁的结局会保存在本地，可重复体验收集全结局

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
│   │   ├── chapters.ts         ← CHAPTERS
│   │   ├── characters.ts       ← CHARACTERS + TRUST_OPTIONS
│   │   ├── clues.ts            ← CLUES
│   │   ├── endings.ts          ← ENDINGS + resolveEnding()
│   │   ├── story.ts            ← STORY (各章 beats)
│   │   └── index.ts
│   ├── components/             ← 通用 UI 组件 (.tsx)
│   │   │   Toast / Topbar / BottomNav / PaperPanel / SealTag
│   │   │   GoldDivider / DialogueBox / ChoiceList / CharacterCard
│   │   │   BottomSheet / ProgressDots / SceneFrame / LockedDungeon
│   │   └── art/                ← SVG 场景插图 / 角色剪影 / 线索/世界观图标
│   ├── pages/                  ← 9 个页面组件 (.tsx)
│   │   │   CoverPage / WorldPage / ChapterSelectPage / StoryPage
│   │   │   CluePage / TrustRoutePage / ProgressPage / EndingPage / GalleryPage
│   ├── lib/
│   │   ├── storage.ts          ← loadState / saveState / defaultState
│   │   └── routes.ts           ← PageKey 联合类型
│   └── styles/global.css       ← 古风 UI 样式系统 (CSS 变量)
├── original/                   ← v0 单文件原型 (HTML + 5 个 jsx,仅作存档参考)
├── README.md
└── LICENSE
```

**技术栈**：Vite 8 · React 19 · TypeScript · CSS Variables · localStorage

> v0 原型采用 Babel Standalone 在浏览器内编译 JSX,完整源码保留在 [`original/`](./original/) 目录下。

---

## 🚀 快速开始

> 需要 Node.js ≥ 18

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

桌面浏览器会显示居中的手机壳预览 (390×844);移动端访问时占满全屏。

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

- **移动优先**：所有交互按触屏设计，不依赖 hover
- **单手操作**：关键按钮高度 ≥48px，底部操作区考虑 safe-area-inset-bottom
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

### 迁移到微信小程序

1. **页面结构**：`pages/*.tsx` → `pages/*/*.wxml` + `.wxss` + `.js`
2. **状态管理**：`useState` → `Page({ data, setData })`
3. **localStorage**：`loadState/saveState` → `wx.getStorageSync` / `wx.setStorageSync`
4. **路由**：`gotoPage` → `wx.navigateTo` / `wx.redirectTo` / `wx.switchTab`
5. **样式**：保留 CSS 变量，px → rpx (1px ≈ 2rpx)
6. **SVG**：小程序对 SVG 支持有限，建议导出为 PNG/WebP 放入 `assets/`
7. **字体**：云字体或图片标题（ZCOOL XiaoWei / Ma Shan Zheng）

详细步骤见 [小程序迁移指南](docs/miniprogram.md)（TODO）

---

## 📊 数据结构

### localStorage 数据

存储 key：`loremender:huatuo:v1`

```typescript
{
  firstChoice: string | null,     // 第1章选择
  ch2: string | null,             // 第2章选择
  searchedClues: string[],        // 已查看的线索 id
  trustedPerson: string | null,   // 托付对象 id
  finalDecision: string | null,   // 第4章最终决定
  currentChapter: number,         // 进度 (1-5)
  unlockedEndings: string[],      // 已解锁结局 id
  lastEnding: string | null,      // 最近一次结局
}
```

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
    { label: "医术无罪", toast: "提示文案", set: { key: value }, ending: "ash" },
    ...
  ]
}

// 跳转
{ gotoChapter: "ch2" }        // 跳转章节
{ gotoTrust: true }           // 跳转人物托付页
{ gotoEnding: true }          // 跳转结局
```

结局由 `resolveEnding(state)` 根据 `finalDecision` + `trustedPerson` 推导。

---

## 🔧 扩展指南

### 新增副本

1. 在 `src/data/story.ts` 中新增章节 `STORY.newDungeon_ch1` 等
2. 在 `src/data/characters.ts` / `clues.ts` / `endings.ts` 中追加相应数据,并在 `src/data/types.ts` 补充类型(如新的 `EndingId`)
3. 在 `src/components/art/` 下新增 `Scene*.tsx` 并在 `art/index.ts` 导出
4. 在 `src/pages/ChapterSelectPage.tsx` 解锁新副本卡片

**示例**:`src/data/story.ts`
```ts
export const STORY: Record<string, StoryChapter> = {
  // ...
  libai_ch1: {
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
- [ ] 第二个副本（李白·谪仙遗恨 / 岳飞·风波未平）
- [ ] AI 生成美术资源替换 SVG 占位
- [ ] 音效 + BGM
- [ ] 动画细节（纸页展开、印章盖落、线索连线）
- [ ] 存档系统（多档位 + 云存档）
- [ ] 成就系统
- [ ] 微信小程序版本
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

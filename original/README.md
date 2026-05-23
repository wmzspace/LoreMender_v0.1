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

## 🎮 核心玩法

- **剧情选择**：每个关键节点都有 2-3 个选择，影响后续剧情与结局
- **线索调查**：在医馆中收集 5 条线索（残页、药方、口述、民谣、施针图），理解"医道未断"的真意
- **人物托付**：在第三章选择一位可信之人托付《青囊经》（徒弟 / 接骨匠 / 歌者 / 兽医）
- **多重结局**：根据你的抉择进入不同结局（原卷成灰 / 密室封存 / 医道未断）
- **结局图鉴**：解锁的结局会保存在本地，可重复体验收集全结局

---

## 📁 项目结构

```
LoreMender/
├── 典故修补者 · 青囊残卷.html  ← 主入口 (打开即玩)
├── styles.css                  ← 古风 UI 样式系统
├── data.jsx                    ← 剧情/角色/线索/结局数据
├── art.jsx                     ← SVG 场景插图 + 角色剪影 + 图标
├── components.jsx              ← 通用组件 (DialogueBox/ChoiceCard/PaperPanel/BottomNav/...)
├── pages.jsx                   ← 各个页面 (Cover/World/ChapterSelect/Story/Clue/Trust/Map/Ending/Gallery)
├── app.jsx                     ← 主路由
├── README.md                   ← 项目文档
└── .gitignore
```

**技术栈**：React 18 + Babel Standalone (inline JSX) + CSS Variables + localStorage

---

## 🚀 快速开始

### 本地运行

**方式 1：直接打开**（桌面预览）
```bash
# 双击 `典故修补者 · 青囊残卷.html` 即可
# 桌面会显示居中的手机壳预览 (390×844)
```

**方式 2：本地服务器**（推荐，支持手机访问）
```bash
# Python
python3 -m http.server 5173

# Node.js
npx serve .

# 或使用任意静态服务器
```

然后访问：
- **桌面**：http://localhost:5173/典故修补者%20·%20青囊残卷.html
- **手机**：在同一局域网内访问电脑 IP（如 http://192.168.1.100:5173/...）

> ⚠️ 由于使用 `type="text/babel"` 加载 JSX，建议通过 http 协议访问（`file://` 在某些浏览器有限制）

### 部署

**零配置部署到 Vercel / Netlify / GitHub Pages**：

1. Fork 本仓库
2. 连接到 Vercel / Netlify
3. 部署（无需构建步骤，纯静态）

**访问路径**：`/典故修补者%20·%20青囊残卷.html`

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

当前使用 **React + Babel Standalone** 实现，等价于 Vite + TypeScript 项目（便于快速原型 + 零构建部署）。

文件结构与标准 React 项目对应：

| 当前文件 | 对应 Vite 项目路径 |
|---------|------------------|
| `data.jsx` | `src/data/story.ts` + `characters.ts` + `clues.ts` + `endings.ts` |
| `art.jsx` | `src/components/art/*.tsx` (SVG 组件) |
| `components.jsx` | `src/components/*.tsx` |
| `pages.jsx` | `src/pages/*.tsx` |
| `app.jsx` | `src/App.tsx` |
| `styles.css` | `src/styles/` (或 Tailwind) |

### 迁移到 Vite + TypeScript

```bash
# 1. 初始化 Vite 项目
npm create vite@latest loremender -- --template react-ts

# 2. 安装依赖
cd loremender && npm install

# 3. 复制文件
# - 把 data.jsx → src/data/*.ts (拆分数据)
# - 把 art.jsx → src/components/art/*.tsx
# - 把 components.jsx → src/components/*.tsx
# - 把 pages.jsx → src/pages/*.tsx
# - 把 app.jsx → src/App.tsx
# - 把 styles.css → src/styles/global.css

# 4. 调整导入
# - window.XXX → import { XXX } from './data'
# - useState_ → useState (去掉下划线)

# 5. 运行
npm run dev
```

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

1. 在 `data.jsx` 中添加新的 `STORY.newDungeon`
2. 添加对应的 `CHARACTERS` / `CLUES` / `ENDINGS`
3. 在 `art.jsx` 中添加新的 `Scene*` SVG 组件
4. 在 `ChapterSelectPage` 中解锁新副本卡片

**示例**：添加「李白·谪仙遗恨」副本
```javascript
// data.jsx
const STORY = {
  ...
  libai_ch1: {
    scene: "palace_night",
    title: "第一章 · 长安月夜",
    beats: [
      { narration: true, line: "天宝三载，长安城..." },
      ...
    ]
  }
}
```

### 替换美术资源

所有视觉当前用 SVG 绘制，可直接替换为真实图片：

```jsx
// art.jsx - Before
function SceneClinic() { return <svg>...</svg>; }

// After
function SceneClinic() {
  return <img src="assets/scenes/clinic.png" style={{width:"100%", height:"100%", objectFit:"cover"}}/>;
}
```

**推荐资源目录**：
```
assets/
  cover/          # 封面插图
  scenes/         # 场景背景
  characters/     # 角色立绘
  endings/        # 结局插图
  icons/          # 线索图标
  textures/       # 纹理素材
```

### 自定义样式

所有颜色/字体/间距在 `styles.css` 中通过 CSS 变量定义：

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

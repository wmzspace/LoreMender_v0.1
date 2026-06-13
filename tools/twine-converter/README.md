# Twine 剧情编辑器集成指南

## 📖 简介

这个工具集帮助你在 Twine 中可视化编辑剧情，并自动转换为项目所需的 TypeScript 格式。

## 🎯 工作流程

```
现有 story.ts 
    ↓ [导出脚本]
Twine HTML 文件 
    ↓ [在 Twine 中可视化编辑]
修改后的 Twine HTML
    ↓ [导入脚本]
新的 story.ts
```

## 🚀 快速开始

### 1. 安装 Twine

**方式一：在线版（推荐新手）**
访问：https://twinery.org/2

**方式二：桌面版（推荐日常使用）**
```bash
# macOS
brew install --cask twine

# 或者下载安装包
# https://github.com/klembot/twinejs/releases
```

### 2. 导出现有剧情到 Twine

```bash
# 在项目根目录运行
npm run story:export

# 生成文件：tools/twine-converter/output/huatuo.html
```

### 3. 在 Twine 中导入和编辑

1. 打开 Twine
2. 点击右侧 "Import From File"
3. 选择 `tools/twine-converter/output/huatuo.html`
4. 可视化编辑你的剧情！

### 4. 导出回项目

编辑完成后：
1. 在 Twine 中：Story → Publish to File
2. 保存为 `huatuo-edited.html`
3. 运行导入脚本：

```bash
npm run story:import tools/twine-converter/output/huatuo-edited.html

# 自动更新 src/data/story.ts
```

## 📊 Twine 节点命名规范

为了保证转换准确性，请遵循以下命名规范：

### 章节节点
```
[CH1] 医馆夜谈
[CH2] 搜查将至
[CH3] 寻找可信之人
[CH4] 青囊抉择
```

### 对话节点
```
[华佗] 你来了...
[徒弟] 这是...
[旁白] 夜雨初停...
```

### 选择分支
```
[选择] 第一章抉择
  → 医术无罪，该留给可信之人
  → 若会害人，不如毁掉
  → 不能现在决定，先弄清真相
```

### 特殊跳转
```
[跳转] 线索页面
[跳转] 托付页面
[跳转] 结局
```

## 🎨 Twine 编辑器技巧

### 添加对话
```
[华佗] 这书该留吗？
[[下一句|华佗对话2]]
```

### 添加选择分支
```
[选择] 第一章抉择

* [[医术无罪，该留给可信之人|选择A]]
* [[若会害人，不如毁掉|选择B]]
* [[不能现在决定，先弄清真相|选择C]]

:: 选择A
<<set $firstChoice = "trust">>
<<set $toast = "你触碰到了这段典故真正的遗憾。">>
[[继续|CH2]]
```

### 添加状态变更
```
<<set $firstChoice = "trust">>
<<set $ch2 = "hide">>
<<set $trustedPerson = "singer">>
<<set $finalDecision = "scatter">>
```

### 添加线索解锁
```
<<set $searchedClues.push("fragment")>>
```

## 🔧 高级功能

### 条件判断
```
<<if $firstChoice == "trust">>
  华佗欣慰地点了点头。
<<else>>
  华佗叹了口气。
<</if>>
```

### 跳转到结局
```
<<if $finalDecision == "burn">>
  [[结局：原卷成灰|ending_ash]]
<<elseif $finalDecision == "scatter" and ["singer","bonesetter","vet"].includes($trustedPerson)>>
  [[结局：医道未断|ending_living]]
<<else>>
  [[结局：密室封存|ending_sealed]]
<</if>>
```

## 📁 文件结构

```
tools/twine-converter/
├── README.md              # 本文件
├── export-to-twine.ts     # 导出脚本（TS → Twine HTML）
├── import-from-twine.ts   # 导入脚本（Twine HTML → TS）
├── templates/
│   └── twine-template.html  # Twine HTML 模板
└── output/
    ├── huatuo.html          # 导出的 Twine 文件
    └── huatuo-edited.html   # 编辑后的文件
```

## 🐛 常见问题

### Q: 转换后丢失了选择分支？
A: 确保在 Twine 中使用 `* [[选项文本|目标节点]]` 格式

### Q: 状态变更没有生效？
A: 检查 `<<set $变量名 = "值">>` 语法是否正确

### Q: 如何预览剧情？
A: 在 Twine 中点击右下角的 "Play" 按钮

### Q: 支持哪个 Twine 故事格式？
A: 推荐使用 **SugarCube 2**，功能最强大

## 📚 参考资源

- [Twine 官网](https://twinery.org/)
- [Twine Cookbook](https://twinery.org/cookbook/)
- [SugarCube 文档](https://www.motoslave.net/sugarcube/2/docs/)

## 🎯 最佳实践

1. **经常保存**：Twine 在线版需要手动保存
2. **版本管理**：每次重大修改后导出 HTML 备份
3. **命名一致**：保持节点名称和项目中的 ID 一致
4. **测试优先**：在 Twine 中测试所有分支路径
5. **渐进迁移**：先迁移一个章节，确认无误后再迁移全部

---

**下一步**：运行 `npm run story:export` 生成 Twine 文件！

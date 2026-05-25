# Twine 可视化剧情编辑器快速开始

## 🎯 一句话总结
用 Twine 可视化编辑剧情，然后自动转换回项目的 TypeScript 代码！

## 🚀 快速上手（3分钟）

### 第一步：安装依赖
```bash
npm install
```

### 第二步：导出现有剧情到 Twine
```bash
npm run story:export
```
生成文件：`tools/twine-converter/output/huatuo.html`

### 第三步：在 Twine 中编辑

**方式一：在线版（无需安装）**
1. 访问 https://twinery.org/2
2. 点击右侧 "Import From File"
3. 选择 `tools/twine-converter/output/huatuo.html`
4. 开始可视化编辑！

**方式二：桌面版（推荐）**
```bash
# macOS
brew install --cask twine

# 或下载：https://github.com/klembot/twinejs/releases
```

### 第四步：导出回项目
1. 在 Twine 中：Story → Publish to File
2. 保存为 `huatuo-edited.html`
3. 运行导入命令：
```bash
npm run story:import tools/twine-converter/output/huatuo-edited.html
```

自动更新 `src/data/story.ts` ✅

## 📊 可视化效果展示

在 Twine 中你会看到这样的剧情图：

```
[开始游戏] ──→ [第一章：医馆夜谈] ──→ [选择1] ──→ [第二章]
                                      ├──→ [选择2] ──→ [第二章]
                                      └──→ [选择3] ──→ [第二章]

[第二章：搜查将至] ──→ [选择] ──→ [线索页面] ──→ [第三章]

[第三章：寻找可信之人] ──→ [托付选择] ──→ [第四章]
                           ├─ 徒弟
                           ├─ 接骨匠
                           ├─ 歌者
                           └─ 兽医

[第四章：青囊抉择] ──→ [最终决定] ──→ [结局]
                                    ├─ 原卷成灰
                                    ├─ 密室封存
                                    └─ 医道未断
```

## 🎨 编辑技巧

### 添加对话
```
**[华佗]**
这书该留吗？

[[下一句|华佗对话2]]
```

### 添加选择分支
```
你的选择：

* [[医术无罪，该留给可信之人|选择A]]
* [[若会害人，不如毁掉|选择B]]
* [[不能现在决定，先弄清真相|选择C]]
```

### 设置状态
```
<<set $firstChoice = "trust">>
<<set $toast = "你触碰到了这段典故真正的遗憾。">>
```

## 🎯 为什么用 Twine？

✅ **可视化**：用连线图展示所有剧情分支  
✅ **即时预览**：点击 Play 按钮立刻测试  
✅ **零学习成本**：拖拽 + 文本编辑，不需要写代码  
✅ **防止遗漏**：一眼看出哪些分支没连好  
✅ **易于迭代**：改剧情比改代码快10倍  

## 📚 完整文档

详细使用指南：`tools/twine-converter/README.md`

## ⚠️ 注意事项

1. **导入前会自动备份**：原 `story.ts` 会保存为 `story.backup.{时间戳}.ts`
2. **首次使用建议**：先导出 → 不做修改 → 导入，测试流程是否正常
3. **复杂逻辑**：某些高级逻辑可能需要手动调整生成的代码

## 🆘 遇到问题？

运行命令时出错，检查：
- ✅ 已运行 `npm install`
- ✅ Twine HTML 文件路径正确
- ✅ 文件格式为 SugarCube 2（Twine 默认格式）

---

**开始使用**：`npm run story:export` 🚀

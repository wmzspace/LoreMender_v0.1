# 典故修补者 · 可视化剧情编辑演示

## 🎬 演示图

用 Twine 可视化编辑剧情的效果展示：

### 在 Twine 中打开后的界面
![Twine Editor](https://i.imgur.com/placeholder.png)

## 🎯 核心功能

### ✅ 已实现
- 导出现有剧情到 Twine HTML 格式
- 在 Twine 中可视化查看所有剧情分支
- 支持拖拽节点、连接关系
- 实时预览剧情流程
- 导入编辑后的 Twine 文件回项目

### 🚧 待完善
- 选择节点的状态变更自动识别
- 线索节点详细内容
- 结局条件判断可视化
- 双向实时同步

## 📖 使用流程

```bash
# 1. 导出现有剧情
npm run story:export

# 2. 在 Twine 中导入
# 打开 https://twinery.org/2
# Import From File → 选择 tools/twine-converter/output/huatuo.html

# 3. 可视化编辑

# 4. 导出回项目
# Twine: Story → Publish to File
npm run story:import path/to/edited.html
```

## 🎨 Twine 中的节点类型

| 节点类型 | 标签 | 说明 |
|---------|------|------|
| Start | start | 游戏开始节点 |
| ch1, ch2, ch3, ch4 | chapter | 章节主节点 |
| ch1_choice_X_Y | choice | 选择分支节点 |
| clue | clue-page | 线索调查页面 |
| trust_page | trust-page | 托付选择页面 |
| ending_X | ending | 结局节点 |

## 🔧 技术细节

### 转换流程
```
TypeScript (story.ts)
    ↓ [AST解析]
JSON 数据结构
    ↓ [格式转换]
Twine Passage 节点
    ↓ [模板渲染]
Twine HTML 文件
```

### 节点格式
```
:: 节点名 [x坐标,y坐标] tags="标签"
节点内容
[[链接文本|目标节点]]
<<set $变量 = "值">>
```

## 🎯 优势对比

| 功能 | 纯代码编辑 | Twine 可视化 |
|------|-----------|-------------|
| 查看分支关系 | ❌ 需要想象 | ✅ 一目了然 |
| 测试剧情 | ⚠️ 需要运行项目 | ✅ 点击即测 |
| 修改成本 | ⚠️ 改多个文件 | ✅ 拖拽节点 |
| 发现遗漏 | ❌ 容易遗漏 | ✅ 断开的连线很明显 |
| 学习曲线 | ⚠️ 需要懂 TS | ✅ 零基础可用 |

## 📚 相关文档

- [完整使用指南](./tools/twine-converter/README.md)
- [快速开始](./TWINE_GUIDE.md)
- [剧情结构文档](./STORY_STRUCTURE.md)

## 🎉 示例截图

### 导出成功
```
🔄 开始转换 story.ts 到 Twine 格式...
✅ 转换完成！
📁 输出文件：tools/twine-converter/output/huatuo.html
```

### Twine 中的剧情图
（节点连接示意）
```
[开始] → [第一章] → [选择分支] → [第二章]
                    ├─ 选项1
                    ├─ 选项2
                    └─ 选项3
```

## 💡 最佳实践

1. **经常导出备份**：在 Twine 中编辑后立刻导出
2. **小步快跑**：一次改一个章节，确认无误后再继续
3. **保留注释**：在节点中添加设计意图的注释
4. **测试分支**：每次修改后在 Twine 中测试所有路径

---

**立即体验**：`npm run story:export` 🚀

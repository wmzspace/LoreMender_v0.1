import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  type Node, type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { STORY } from '../data/story';
import { ENDINGS } from '../data/endings';
import { storyToFlow, flowToStory, storyToTypeScript } from './storyToFlow';
import type { StoryNodeData, EndingNodeData } from './storyToFlow';
import {
  ChapterNode, NarrationNode, DialogueNode,
  ChoiceNode, GotoNode, EndingNode,
} from './FlowNodes';
import NodePropsPanel from './NodePropsPanel';

const nodeTypes: NodeTypes = {
  chapterNode: ChapterNode,
  narrationNode: NarrationNode,
  dialogueNode: DialogueNode,
  choiceNode: ChoiceNode,
  gotoNode: GotoNode,
  endingNode: EndingNode,
};

// 生成结局节点（放在右侧固定位置）
function buildEndingNodes(): Node<StoryNodeData>[] {
  const endingList = [
    { id: 'ash', x: 2200, y: 200 },
    { id: 'sealed', x: 2200, y: 400 },
    { id: 'living', x: 2200, y: 600 },
  ];
  return endingList.map(({ id, x, y }) => {
    const e = ENDINGS[id as 'ash' | 'sealed' | 'living'];
    return {
      id: `ending_${id}`,
      type: 'endingNode',
      position: { x, y },
      data: {
        kind: 'ending',
        endingId: id,
        name: e.name,
        rank: e.rank,
        body: e.body,
      } as EndingNodeData,
    };
  });
}

export default function StoryFlowEditor() {
  const { nodes: initNodes, edges: initEdges } = storyToFlow(STORY);
  const endingNodes = buildEndingNodes();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StoryNodeData>>([
    ...initNodes,
    ...endingNodes,
  ] as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [selectedNode, setSelectedNode] = useState<Node<StoryNodeData> | null>(null);
  const [exportMsg, setExportMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const exportTimer = useRef<any>(null);

  const handleNodeClick = useCallback((_: any, node: Node<StoryNodeData>) => {
    setSelectedNode(node);
  }, []);

  const handleNodeChange = useCallback((nodeId: string, data: StoryNodeData) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data } : n));
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data } : prev);
  }, [setNodes]);

  const handleExport = useCallback(() => {
    try {
      const story = flowToStory(nodes as Node<StoryNodeData>[], edges);
      const tsCode = storyToTypeScript(story);

      // 创建下载
      const blob = new Blob([tsCode], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'story.ts';
      a.click();
      URL.revokeObjectURL(url);

      setExportMsg({ text: '✅ story.ts 已下载！手动替换 src/data/story.ts', ok: true });
    } catch (e) {
      setExportMsg({ text: `❌ 导出失败：${e}`, ok: false });
    }
    clearTimeout(exportTimer.current);
    exportTimer.current = setTimeout(() => setExportMsg(null), 5000);
  }, [nodes, edges]);

  const handleCopyCode = useCallback(() => {
    try {
      const story = flowToStory(nodes as Node<StoryNodeData>[], edges);
      const tsCode = storyToTypeScript(story);
      navigator.clipboard.writeText(tsCode);
      setExportMsg({ text: '✅ 代码已复制到剪贴板！', ok: true });
    } catch (e) {
      setExportMsg({ text: `❌ 复制失败：${e}`, ok: false });
    }
    clearTimeout(exportTimer.current);
    exportTimer.current = setTimeout(() => setExportMsg(null), 4000);
  }, [nodes, edges]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0d0905', position: 'relative' }}>
      {/* 顶部工具栏 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 52, background: '#120e08',
        borderBottom: '2px solid #c9a14a',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12,
      }}>
        <span style={{ color: '#c9a14a', fontWeight: 800, fontSize: 16, marginRight: 8 }}>
          典故修补者 · 剧情编辑器
        </span>
        <div style={{ width: 1, height: 24, background: '#3a2a10' }} />
        <a href="/" style={{ color: '#806040', fontSize: 12, textDecoration: 'none' }}>← 回到游戏</a>
        <div style={{ flex: 1 }} />

        {exportMsg && (
          <div style={{
            padding: '6px 14px',
            borderRadius: 6,
            background: exportMsg.ok ? '#0a2a0a' : '#2a0a0a',
            color: exportMsg.ok ? '#80ff80' : '#ff8080',
            fontSize: 12,
            border: `1px solid ${exportMsg.ok ? '#2a5a2a' : '#5a2a2a'}`,
          }}>
            {exportMsg.text}
          </div>
        )}

        <button
          onClick={handleCopyCode}
          style={{
            padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: '#1a2a3a', color: '#7ab4ff', fontWeight: 600, fontSize: 13,
          }}>
          📋 复制代码
        </button>
        <button
          onClick={handleExport}
          style={{
            padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: '#c9a14a', color: '#0d0905', fontWeight: 700, fontSize: 13,
          }}>
          ⬇ 导出 story.ts
        </button>
      </div>

      {/* React Flow 画布 */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: 52 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          style={{ background: '#0d0905' }}
          defaultEdgeOptions={{
            style: { stroke: '#5a4a2a', strokeWidth: 2 },
            animated: false,
          }}
        >
          <Background color="#2a1a08" gap={32} />
          <Controls
            style={{ background: '#1a1208', border: '1px solid #3a2a10' }}
          />
          <MiniMap
            style={{ background: '#0f0c08', border: '1px solid #3a2a10' }}
            nodeColor={(n) => {
              const d = (n.data as StoryNodeData);
              if (d.kind === 'chapter') return '#c9a14a';
              if (d.kind === 'choice') return '#ffb968';
              if (d.kind === 'ending') return '#6b3a2a';
              if (d.kind === 'narration') return '#5a6b4a';
              if (d.kind === 'dialogue') return '#4a5a6b';
              return '#3a3a3a';
            }}
            maskColor="rgba(13,9,5,0.7)"
          />
        </ReactFlow>
      </div>

      {/* 右侧属性面板 */}
      {selectedNode && (
        <NodePropsPanel
          node={selectedNode as Node<StoryNodeData>}
          onChange={handleNodeChange}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* 图例 */}
      <div style={{
        position: 'fixed', bottom: 16, left: 16, zIndex: 50,
        background: '#120e08', border: '1px solid #3a2a10',
        borderRadius: 8, padding: '10px 14px',
        display: 'flex', gap: 12, flexWrap: 'wrap',
        fontSize: 11, color: '#806040',
      }}>
        {[
          { color: '#c9a14a', label: '章节' },
          { color: '#6b7a5a', label: '旁白' },
          { color: '#5a6b7a', label: '对话' },
          { color: '#ffb968', label: '选择' },
          { color: '#4a7ac9', label: '跳转' },
          { color: '#8a3a2a', label: '结局' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 8, color: '#605040' }}>点击节点编辑 · 拖拽移动</div>
      </div>
    </div>
  );
}

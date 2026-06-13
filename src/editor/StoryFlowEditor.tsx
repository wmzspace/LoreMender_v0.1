import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  type Node, type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { STORY } from '../data/dungeons/huatuo/story';
import { CHAPTERS } from '../data/dungeons/huatuo/chapters';
import { ENDINGS } from '../data/dungeons/huatuo/endings';
import { storyToFlow, flowToStory, storyToTypeScript } from './storyToFlow';
import type { StoryNodeData, EndingNodeData } from './storyToFlow';
import {
  ChapterNode, NarrationNode, DialogueBlockNode,
  ChoiceNode, GotoNode, EndingNode,
} from './FlowNodes';
import NodePropsPanel from './NodePropsPanel';

const nodeTypes: NodeTypes = {
  chapterNode: ChapterNode,
  narrationNode: NarrationNode,
  dialogueBlockNode: DialogueBlockNode,
  choiceNode: ChoiceNode,
  gotoNode: GotoNode,
  endingNode: EndingNode,
};

type ViewMode = 'flow' | 'code';

// 章节跳转目标色
const chapterAccent: Record<string, string> = {
  ch1: '#3b82f6', ch2: '#8b5cf6', ch3: '#10b981', ch4: '#f59e0b',
};

function buildEndingNodes(): Node<StoryNodeData>[] {
  return [
    { id: 'ash', x: 900, y: 40 },
    { id: 'sealed', x: 900, y: 200 },
    { id: 'living', x: 900, y: 360 },
  ].map(({ id, x, y }) => {
    const e = ENDINGS[id as 'ash' | 'sealed' | 'living'];
    return {
      id: `ending_${id}`, type: 'endingNode', position: { x, y },
      data: { kind: 'ending', endingId: id, name: e.name, rank: e.rank, body: e.body } as EndingNodeData,
    };
  });
}

function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, m => `<span style="color:#0891b2">${m}</span>`)
    .replace(/\b(import|export|const|let|var|type|from|as|true|false|null)\b/g,
      m => `<span style="color:#7c3aed;font-weight:600">${m}</span>`)
    .replace(/(\/\/[^\n]*)/g, m => `<span style="color:#94a3b8;font-style:italic">${m}</span>`)
    .replace(/\b(\w+)(?=\s*:)/g, m => `<span style="color:#1d4ed8">${m}</span>`);
}

// ── 左侧菜单数据 ─────────────────────────────────────────────────
const DUNGEONS = [
  {
    id: 'huatuo',
    name: '华佗 · 青囊残卷',
    chapters: CHAPTERS.map(ch => ({ id: ch.id, name: ch.name })),
  },
  // 未来副本占位（添加新副本时在这里注册）
  // { id: 'libai', name: '李白 · 谪仙遗恨', chapters: [] },
  // { id: 'yuefi', name: '岳飞 · 风波未平', chapters: [] },
];

export default function StoryFlowEditor() {
  // ── 节点状态 ─────────────────────────────────────────────────
  const { nodes: initNodes, edges: initEdges } = storyToFlow(STORY);
  const endingNodes = buildEndingNodes();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StoryNodeData>>([
    ...initNodes, ...endingNodes,
  ] as any);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  // ── 视图状态 ─────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [selectedNode, setSelectedNode] = useState<Node<StoryNodeData> | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | 'all'>('all');
  const [expandedDungeon, setExpandedDungeon] = useState<string>('huatuo');
  const [codeText, setCodeText] = useState('');
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const toastTimer = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hlRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (taRef.current && hlRef.current) {
      hlRef.current.scrollTop = taRef.current.scrollTop;
      hlRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // 当前显示哪些节点（按章节过滤）
  const visibleNodes = activeChapter === 'all'
    ? nodes
    : nodes.filter(n => {
        const d = n.data as any;
        if (d.kind === 'chapter') return d.chapterId === activeChapter;
        if (d.kind === 'ending') return false; // 查看单章时隐藏结局
        return d.chapterId === activeChapter;
      });

  const visibleEdges = activeChapter === 'all'
    ? edges
    : edges.filter(e => {
        const src = visibleNodes.find(n => n.id === e.source);
        const tgt = visibleNodes.find(n => n.id === e.target);
        return src && tgt;
      });

  // ── 处理函数 ─────────────────────────────────────────────────
  const handleNodeClick = useCallback((_: any, node: Node<StoryNodeData>) => {
    setSelectedNode(node);
  }, []);

  const handleNodeChange = useCallback((nodeId: string, data: StoryNodeData) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data } : n));
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data } : prev);
  }, [setNodes]);

  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  const switchToCode = () => {
    const story = flowToStory(nodes as Node<StoryNodeData>[], edges);
    setCodeText(storyToTypeScript(story));
    setViewMode('code');
  };

  const handleExport = () => {
    const code = viewMode === 'code' ? codeText : storyToTypeScript(flowToStory(nodes as any, edges));
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'story.ts'; a.click();
    URL.revokeObjectURL(url);
    showToast('story.ts 已下载，替换到 src/data/ 目录即可', true);
  };

  const handleCopy = () => {
    const code = viewMode === 'code' ? codeText : storyToTypeScript(flowToStory(nodes as any, edges));
    navigator.clipboard.writeText(code);
    showToast('代码已复制到剪贴板', true);
  };

  const hasPanel = viewMode === 'flow' && selectedNode;
  const SIDEBAR_W = 200;
  const PANEL_W = 348;

  // ── 渲染 ─────────────────────────────────────────────────────
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

      {/* ── 顶部工具栏 ── */}
      <div style={{
        height: 52, background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
        flexShrink: 0, zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: '#3b82f6', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff', fontWeight: 800,
          }}>L</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Story Editor</span>
        </div>

        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* 视图切换 */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
          {(['flow', 'code'] as ViewMode[]).map(mode => (
            <button key={mode}
              onClick={() => mode === 'flow' ? setViewMode('flow') : switchToCode()}
              style={{
                padding: '4px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 12,
                background: viewMode === mode ? '#fff' : 'transparent',
                color: viewMode === mode ? '#1e293b' : '#64748b',
                boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
              {mode === 'flow' ? '🔗 节点图' : '</> 代码'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {toast && (
          <div style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: toast.ok ? '#f0fdf4' : '#fff1f2',
            color: toast.ok ? '#16a34a' : '#be123c',
            border: `1px solid ${toast.ok ? '#bbf7d0' : '#fecdd3'}`,
          }}>{toast.text}</div>
        )}

        <a href="/" style={{
          padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
          color: '#64748b', fontSize: 12, fontWeight: 500, textDecoration: 'none',
        }}>← 游戏</a>

        <button onClick={handleCopy} style={{
          padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
          background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>📋 复制</button>

        <button onClick={handleExport} style={{
          padding: '5px 14px', borderRadius: 6, border: 'none',
          background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>⬇ 导出</button>
      </div>

      {/* ── 主体区域 ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── 左侧导航菜单 ── */}
        <div style={{
          width: SIDEBAR_W, flexShrink: 0, background: '#fff',
          borderRight: '1px solid #e2e8f0', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 12px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
            副本
          </div>

          {DUNGEONS.map(dungeon => (
            <div key={dungeon.id}>
              {/* 一级：副本 */}
              <button
                onClick={() => setExpandedDungeon(expandedDungeon === dungeon.id ? '' : dungeon.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#1e293b',
                }}>
                <span>📖 {dungeon.name}</span>
                <span style={{ color: '#94a3b8', fontSize: 11 }}>
                  {expandedDungeon === dungeon.id ? '▾' : '▸'}
                </span>
              </button>

              {/* 二级：章节列表 */}
              {expandedDungeon === dungeon.id && (
                <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  {/* 全部 */}
                  <button
                    onClick={() => { setActiveChapter('all'); setSelectedNode(null); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '7px 12px 7px 24px',
                      border: 'none', cursor: 'pointer', fontSize: 12,
                      background: activeChapter === 'all' ? '#eff6ff' : 'transparent',
                      color: activeChapter === 'all' ? '#1d4ed8' : '#475569',
                      fontWeight: activeChapter === 'all' ? 600 : 400,
                      borderLeft: activeChapter === 'all' ? '3px solid #3b82f6' : '3px solid transparent',
                    }}>
                    全部章节
                  </button>

                  {dungeon.chapters.map(ch => {
                    const accent = chapterAccent[ch.id] ?? '#3b82f6';
                    const isActive = activeChapter === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => { setActiveChapter(ch.id); setSelectedNode(null); }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '7px 12px 7px 24px',
                          border: 'none', cursor: 'pointer', fontSize: 12,
                          background: isActive ? `${accent}18` : 'transparent',
                          color: isActive ? accent : '#475569',
                          fontWeight: isActive ? 600 : 400,
                          borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                          transition: 'all 0.1s',
                        }}>
                        <div>{ch.name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{ch.id}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* 底部：图例 */}
          <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>图例</div>
            {[
              { c: '#3b82f6', l: '章节' }, { c: '#94a3b8', l: '旁白' },
              { c: '#22c55e', l: '对话' }, { c: '#f59e0b', l: '选择' },
              { c: '#a855f7', l: '跳转' }, { c: '#f43f5e', l: '结局' },
            ].map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 右侧内容区 ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* 节点图视图 */}
          {viewMode === 'flow' && (
            <>
              {/* 章节面包屑 */}
              {activeChapter !== 'all' && (
                <div style={{
                  position: 'absolute', top: 12, left: 12, zIndex: 20,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '6px 14px', fontSize: 12, color: '#475569',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ color: '#94a3b8' }}>全部</span>
                  <span>›</span>
                  <span style={{ color: chapterAccent[activeChapter] ?? '#3b82f6', fontWeight: 600 }}>
                    {CHAPTERS.find(c => c.id === activeChapter)?.name ?? activeChapter}
                  </span>
                </div>
              )}

              <div style={{
                position: 'absolute', inset: 0,
                paddingRight: hasPanel ? PANEL_W : 0,
                transition: 'padding-right 0.2s',
              }}>
                <ReactFlow
                  key={activeChapter} // 切章节时重新 fitView
                  nodes={visibleNodes as any}
                  edges={visibleEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={handleNodeClick}
                  onPaneClick={handlePaneClick}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.15 }}
                  style={{ background: '#f8fafc' }}
                  defaultEdgeOptions={{ style: { stroke: '#cbd5e1', strokeWidth: 2 }, animated: false }}
                >
                  <Background color="#e2e8f0" gap={24} />
                  <Controls style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
                  <MiniMap
                    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                    nodeColor={(n) => {
                      const k = (n.data as StoryNodeData).kind;
                      return { chapter: '#3b82f6', narration: '#94a3b8', dialogueBlock: '#22c55e', choice: '#f59e0b', goto: '#a855f7', ending: '#f43f5e' }[k] ?? '#94a3b8';
                    }}
                    maskColor="rgba(248,250,252,0.8)"
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
            </>
          )}

          {/* 代码视图 */}
          {viewMode === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
              <div style={{
                padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, flexShrink: 0,
              }}>
                <span style={{ color: '#64748b', fontFamily: 'monospace' }}>src/data/story.ts</span>
                <div style={{ padding: '2px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>TypeScript</div>
                <div style={{ flex: 1 }} />
                <span style={{ color: '#94a3b8' }}>直接编辑，切换节点图后重新读取</span>
              </div>
              <div style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                fontSize: 13, lineHeight: 1.7,
              }}>
                <div ref={hlRef} aria-hidden style={{
                  position: 'absolute', inset: 0, padding: '16px 20px',
                  overflow: 'auto', whiteSpace: 'pre', color: '#1e293b',
                  pointerEvents: 'none', userSelect: 'none',
                }} dangerouslySetInnerHTML={{ __html: highlight(codeText) + '\n' }} />
                <textarea ref={taRef} value={codeText}
                  onChange={e => setCodeText(e.target.value)}
                  onScroll={syncScroll}
                  spellCheck={false}
                  style={{
                    position: 'absolute', inset: 0, padding: '16px 20px',
                    width: '100%', height: '100%', background: 'transparent',
                    border: 'none', outline: 'none', resize: 'none',
                    fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
                    color: 'transparent', caretColor: '#1e293b',
                    whiteSpace: 'pre', overflowWrap: 'normal',
                    boxSizing: 'border-box', overflow: 'auto',
                  }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

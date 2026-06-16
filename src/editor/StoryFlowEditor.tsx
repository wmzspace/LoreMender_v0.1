import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  type Node, type NodeTypes, type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { STORY as HUATUO_STORY } from '../data/dungeons/huatuo/story';
import { CHAPTERS } from '../data/dungeons/huatuo/chapters';
import { ENDINGS } from '../data/dungeons/huatuo/endings';
import { storyToFlow, flowToStory, storyToTypeScript } from './storyToFlow';
import type {
  StoryNodeData, NarrationNodeData, DialogueBlockNodeData,
  ChoiceNodeData, GotoNodeData, EndingNodeData,
} from './storyToFlow';
import {
  ChapterNode, NarrationNode, DialogueBlockNode,
  ChoiceNode, GotoNode, EndingNode,
} from './FlowNodes';
import NodePropsPanel from './NodePropsPanel';
import type { StoryChapter } from '../data/types';

const nodeTypes: NodeTypes = {
  chapterNode: ChapterNode,
  narrationNode: NarrationNode,
  dialogueBlockNode: DialogueBlockNode,
  choiceNode: ChoiceNode,
  gotoNode: GotoNode,
  endingNode: EndingNode,
};

type ViewMode = 'flow' | 'code';

const chapterAccent: Record<string, string> = {
  ch1: '#3b82f6', ch2: '#8b5cf6', ch3: '#10b981', ch4: '#f59e0b', ch5: '#ec4899',
};

function buildEndingNodes(): Node<StoryNodeData>[] {
  return Object.values(ENDINGS).map((e, idx) => ({
    id: `ending_${e.id}`, type: 'endingNode', position: { x: 2800, y: 40 + idx * 180 },
    data: { kind: 'ending', endingId: e.id, name: e.name, rank: e.rank, body: e.body } as EndingNodeData,
  }));
}

const DUNGEONS = [
  {
    id: 'huatuo',
    name: '华佗 · 青囊残卷',
    chapters: CHAPTERS.map(ch => ({ id: ch.id, name: ch.name })),
  },
];

const ADD_NODE_TYPES = [
  { kind: 'dialogueBlock' as const, label: '💬 对话', color: '#22c55e' },
  { kind: 'narration'    as const, label: '📜 旁白', color: '#94a3b8' },
  { kind: 'choice'       as const, label: '⚡ 选择', color: '#f59e0b' },
  { kind: 'goto'         as const, label: '→ 跳转', color: '#a855f7' },
];

const BLANK_STORY: Record<string, StoryChapter> = {
  ch1: { scene: 'final_choice', title: '第一章', fullTitle: '第一章', beats: [] },
};

export default function StoryFlowEditor() {
  // ── 副本选择（huatuo 或新建空白副本） ────────────────────────────
  const [activeDungeon, setActiveDungeon] = useState<'huatuo' | 'blank'>('huatuo');
  const [blankName, setBlankName] = useState('未命名副本');
  const activeStory = activeDungeon === 'huatuo' ? HUATUO_STORY : BLANK_STORY;

  // ── 节点状态 ─────────────────────────────────────────────────
  const { nodes: initNodes, edges: initEdges } = storyToFlow(activeStory);
  const endingNodes = activeDungeon === 'huatuo' ? buildEndingNodes() : [];

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StoryNodeData>>([
    ...initNodes, ...endingNodes,
  ] as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  // ── 视图状态 ─────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [selectedNode, setSelectedNode] = useState<Node<StoryNodeData> | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | 'all'>('all');
  const [expandedDungeon, setExpandedDungeon] = useState<string>('huatuo');
  const [codeText, setCodeText] = useState('');
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // ── 节点过滤 ─────────────────────────────────────────────────
  const visibleNodeIds = new Set(
    activeChapter === 'all'
      ? nodes.map(n => n.id)
      : nodes.filter(n => {
          const d = n.data as any;
          if (d.kind === 'ending') return false;
          return d.kind === 'chapter' ? d.chapterId === activeChapter : d.chapterId === activeChapter;
        }).map(n => n.id)
  );
  const visibleNodes = nodes.filter(n => visibleNodeIds.has(n.id));
  const visibleEdges = edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  // ── 连接处理 ─────────────────────────────────────────────────
  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, type: 'smoothstep' }, eds));
  }, [setEdges]);

  // ── 节点操作 ─────────────────────────────────────────────────
  const handleNodeClick = useCallback((_: any, node: Node<StoryNodeData>) => {
    setSelectedNode(node);
  }, []);

  const handleNodeChange = useCallback((nodeId: string, data: StoryNodeData) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data } : n));
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data } : prev);
  }, [setNodes]);

  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  // ── 添加节点 ─────────────────────────────────────────────────
  const addNode = useCallback((kind: 'narration' | 'dialogueBlock' | 'choice' | 'goto') => {
    if (activeChapter === 'all') return;

    const chNodes = nodes.filter(n => (n.data as any).chapterId === activeChapter);
    const maxY = chNodes.reduce((max, n) => Math.max(max, n.position.y + 100), 200);
    const baseX = nodes.find(
      n => n.data.kind === 'chapter' && (n.data as any).chapterId === activeChapter
    )?.position.x ?? 100;

    const id = `${activeChapter}_${kind}_${Date.now()}`;
    const pos = { x: baseX, y: maxY + 50 };

    const newData: StoryNodeData =
      kind === 'narration'
        ? { kind, chapterId: activeChapter, beatIndex: 9999, line: '（旁白内容）' } as NarrationNodeData
      : kind === 'dialogueBlock'
        ? { kind, chapterId: activeChapter, beatIndex: 9999, lines: [{ speaker: 'aj', line: '...' }] } as DialogueBlockNodeData
      : kind === 'choice'
        ? { kind, chapterId: activeChapter, beatIndex: 9999, choices: [{ label: '选项一', set: {} }, { label: '选项二', set: {} }] } as ChoiceNodeData
        : { kind, chapterId: activeChapter, beatIndex: 9999, target: 'ending' } as GotoNodeData;

    const typeMap: Record<string, string> = {
      narration: 'narrationNode', dialogueBlock: 'dialogueBlockNode',
      choice: 'choiceNode', goto: 'gotoNode',
    };

    const newNode: Node<StoryNodeData> = { id, type: typeMap[kind], position: pos, data: newData };
    setNodes(nds => [...nds, newNode]);

    const lastNode = [...chNodes].sort((a, b) => b.position.y - a.position.y)[0];
    if (lastNode) {
      setEdges(eds => [...eds, {
        id: `e_${lastNode.id}_${id}`, source: lastNode.id, target: id, type: 'smoothstep',
      }]);
    }

    setSelectedNode(newNode as any);
  }, [activeChapter, nodes, setNodes, setEdges]);

  // ── 删除节点 ─────────────────────────────────────────────────
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    showToast('节点已删除', true);
  }, [setNodes, setEdges]);

  // ── 新建空白副本 ─────────────────────────────────────────────
  const handleNewDungeon = () => {
    const name = window.prompt('新副本名称：', '未命名副本');
    if (name === null) return;
    setBlankName(name || '未命名副本');
    setActiveDungeon('blank');
    setExpandedDungeon('blank');
    setActiveChapter('all');
    setSelectedNode(null);
    setViewMode('flow');
    const { nodes: n, edges: e } = storyToFlow(BLANK_STORY);
    setNodes(n as any);
    setEdges(e);
  };

  // ── 代码视图 ─────────────────────────────────────────────────
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
    showToast('story.ts 已下载，替换到 src/data/dungeons/huatuo/ 即可', true);
  };

  const handleCopy = () => {
    const code = viewMode === 'code' ? codeText : storyToTypeScript(flowToStory(nodes as any, edges));
    navigator.clipboard.writeText(code).then(() => {
      showToast('代码已复制到剪贴板', true);
    }).catch(() => {
      showToast('复制失败，请手动选取', false);
    });
  };

  const hasPanel = viewMode === 'flow' && selectedNode;
  const SIDEBAR_W = 200;
  const PANEL_W = 348;
  const canAdd = activeChapter !== 'all' && viewMode === 'flow';

  // 章节列表（huatuo 用静态 CHAPTERS，blank 用 BLANK_STORY key）
  const activeDungeonChapters = activeDungeon === 'huatuo'
    ? CHAPTERS.map(ch => ({ id: ch.id, name: ch.name }))
    : Object.keys(BLANK_STORY).map(id => ({ id, name: id }));

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

          {/* 华佗副本 */}
          {DUNGEONS.map(dungeon => (
            <div key={dungeon.id}>
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

              {expandedDungeon === dungeon.id && (
                <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => { setActiveDungeon('huatuo'); setActiveChapter('all'); setSelectedNode(null); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '7px 12px 7px 24px',
                      border: 'none', cursor: 'pointer', fontSize: 12,
                      background: activeDungeon === 'huatuo' && activeChapter === 'all' ? '#eff6ff' : 'transparent',
                      color: activeDungeon === 'huatuo' && activeChapter === 'all' ? '#1d4ed8' : '#475569',
                      fontWeight: activeDungeon === 'huatuo' && activeChapter === 'all' ? 600 : 400,
                      borderLeft: activeDungeon === 'huatuo' && activeChapter === 'all' ? '3px solid #3b82f6' : '3px solid transparent',
                    }}>
                    全部章节
                  </button>

                  {dungeon.chapters.map(ch => {
                    const accent = chapterAccent[ch.id] ?? '#3b82f6';
                    const isActive = activeDungeon === 'huatuo' && activeChapter === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => { setActiveDungeon('huatuo'); setActiveChapter(ch.id); setSelectedNode(null); }}
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

          {/* 新建空白副本 */}
          {activeDungeon === 'blank' && (
            <div>
              <button
                onClick={() => setExpandedDungeon(expandedDungeon === 'blank' ? '' : 'blank')}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: 'none', background: '#eff6ff', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#1e293b',
                }}>
                <span>✏️ {blankName}</span>
                <span style={{ color: '#94a3b8', fontSize: 11 }}>
                  {expandedDungeon === 'blank' ? '▾' : '▸'}
                </span>
              </button>
              {expandedDungeon === 'blank' && (
                <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => { setActiveChapter('all'); setSelectedNode(null); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '7px 12px 7px 24px',
                      border: 'none', cursor: 'pointer', fontSize: 12,
                      background: activeChapter === 'all' ? '#eff6ff' : 'transparent',
                      color: activeChapter === 'all' ? '#1d4ed8' : '#475569',
                      fontWeight: activeChapter === 'all' ? 600 : 400,
                      borderLeft: activeChapter === 'all' ? '3px solid #3b82f6' : '3px solid transparent',
                    }}>全部章节</button>
                  {activeDungeonChapters.map(ch => {
                    const isActive = activeChapter === ch.id;
                    return (
                      <button key={ch.id}
                        onClick={() => { setActiveChapter(ch.id); setSelectedNode(null); }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '7px 12px 7px 24px',
                          border: 'none', cursor: 'pointer', fontSize: 12,
                          background: isActive ? '#eff6ff' : 'transparent',
                          color: isActive ? '#3b82f6' : '#475569',
                          fontWeight: isActive ? 600 : 400,
                          borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                        }}>
                        <div>{ch.name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{ch.id}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 新建按钮 */}
          <button onClick={handleNewDungeon} style={{
            margin: '8px 12px', padding: '7px 10px', borderRadius: 6,
            border: '1px dashed #cbd5e1', background: 'transparent',
            color: '#64748b', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>+</span> 新建空白副本
          </button>

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
              {/* 顶部状态栏：面包屑 + 添加节点按钮 */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: hasPanel ? PANEL_W : 0, zIndex: 20,
                height: 44, background: '#fff', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', flex: 1 }}>
                  {activeChapter === 'all' ? (
                    <span style={{ color: '#94a3b8' }}>全部章节</span>
                  ) : (
                    <>
                      <button onClick={() => { setActiveChapter('all'); setSelectedNode(null); }}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                        全部
                      </button>
                      <span style={{ color: '#cbd5e1' }}>›</span>
                      <span style={{ color: chapterAccent[activeChapter] ?? '#3b82f6', fontWeight: 600 }}>
                        {activeDungeonChapters.find(c => c.id === activeChapter)?.name ?? activeChapter}
                      </span>
                    </>
                  )}
                </div>

                {canAdd && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {ADD_NODE_TYPES.map(({ kind, label, color }) => (
                      <button key={kind} onClick={() => addNode(kind)} style={{
                        padding: '4px 10px', borderRadius: 5, border: `1px solid ${color}`,
                        background: '#fff', color, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = `${color}18`)}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                      >
                        + {label}
                      </button>
                    ))}
                  </div>
                )}
                {activeChapter === 'all' && (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>选择章节以添加节点</span>
                )}
              </div>

              <div style={{
                position: 'absolute', top: 44, bottom: 0, left: 0,
                right: hasPanel ? PANEL_W : 0,
                transition: 'right 0.2s',
              }}>
                <ReactFlow
                  key={`${activeDungeon}_${activeChapter}`}
                  nodes={visibleNodes as any}
                  edges={visibleEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={handleNodeClick}
                  onPaneClick={handlePaneClick}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.15 }}
                  style={{ background: '#f8fafc' }}
                  defaultEdgeOptions={{ style: { stroke: '#cbd5e1', strokeWidth: 2 }, animated: false }}
                  deleteKeyCode={['Delete', 'Backspace']}
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

                {!selectedNode && (
                  <div style={{
                    position: 'absolute', bottom: 16, right: 16, zIndex: 5,
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                    padding: '8px 14px', fontSize: 11, color: '#94a3b8',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    点击节点查看属性 · 拖动 Handle 连线 · Backspace/Del 删除选中
                  </div>
                )}
              </div>

              {selectedNode && (
                <NodePropsPanel
                  node={selectedNode as Node<StoryNodeData>}
                  onChange={handleNodeChange}
                  onDelete={deleteNode}
                  onClose={() => setSelectedNode(null)}
                />
              )}
            </>
          )}

          {/* 代码视图 */}
          {viewMode === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
              <div style={{
                padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, flexShrink: 0,
              }}>
                <span style={{ color: '#64748b', fontFamily: 'monospace' }}>src/data/dungeons/huatuo/story.ts</span>
                <div style={{ padding: '2px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>TypeScript</div>
                <div style={{ flex: 1 }} />
                <span style={{ color: '#94a3b8' }}>可直接编辑 · 导出后替换源文件即可生效</span>
              </div>
              <textarea
                ref={taRef}
                value={codeText}
                onChange={e => setCodeText(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1, display: 'block',
                  width: '100%', boxSizing: 'border-box',
                  padding: '16px 20px',
                  background: '#0f172a', color: '#e2e8f0',
                  border: 'none', outline: 'none', resize: 'none',
                  fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                  fontSize: 13, lineHeight: 1.7,
                  whiteSpace: 'pre', overflowWrap: 'normal', overflow: 'auto',
                  caretColor: '#f8fafc',
                  userSelect: 'text', WebkitUserSelect: 'text',
                } as React.CSSProperties}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const ta = e.currentTarget;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const next = codeText.slice(0, start) + '  ' + codeText.slice(end);
                    setCodeText(next);
                    requestAnimationFrame(() => {
                      ta.selectionStart = ta.selectionEnd = start + 2;
                    });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

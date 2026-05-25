import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type {
  ChapterNodeData, NarrationNodeData, DialogueNodeData,
  ChoiceNodeData, GotoNodeData, EndingNodeData,
} from './storyToFlow';

const s: Record<string, React.CSSProperties> = {
  base: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid #c9a14a',
    minWidth: 240,
    maxWidth: 300,
    fontSize: 13,
    background: '#1a120a',
    color: '#ebd9b3',
    boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
    cursor: 'pointer',
  },
  header: {
    fontWeight: 700,
    marginBottom: 6,
    fontSize: 13,
    color: '#c9a14a',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    marginBottom: 6,
    fontWeight: 600,
  },
  line: {
    color: '#d4c4a0',
    lineHeight: 1.5,
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
  },
  choiceItem: {
    background: 'rgba(201,161,74,0.1)',
    borderLeft: '3px solid #c9a14a',
    padding: '4px 8px',
    marginTop: 5,
    borderRadius: '0 4px 4px 0',
    fontSize: 12,
    color: '#ebd9b3',
  },
};

// 章节节点
export function ChapterNode({ data }: NodeProps) {
  const d = data as ChapterNodeData;
  return (
    <div style={{ ...s.base, border: '2px solid #c9a14a', background: '#2a1a08' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ ...s.tag, background: '#c9a14a', color: '#0d0905' }}>📚 章节</div>
      <div style={{ fontWeight: 800, fontSize: 15, color: '#ffb968', marginBottom: 4 }}>{d.title}</div>
      <div style={{ fontSize: 11, color: '#a08060' }}>场景：{d.scene}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// 旁白节点
export function NarrationNode({ data }: NodeProps) {
  const d = data as NarrationNodeData;
  return (
    <div style={{ ...s.base, borderColor: '#6b7a5a', background: '#141a10' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ ...s.tag, background: '#6b7a5a', color: '#ebd9b3' }}>📜 旁白</div>
      <div style={s.line}>{d.line}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// 对话节点
export function DialogueNode({ data }: NodeProps) {
  const d = data as DialogueNodeData;
  return (
    <div style={{ ...s.base, borderColor: '#5a6b7a', background: '#101820' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ ...s.tag, background: '#5a6b7a', color: '#ebd9b3' }}>💬 {d.speaker}</div>
      <div style={s.line}>{d.line}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// 选择分支节点
export function ChoiceNode({ data }: NodeProps) {
  const d = data as ChoiceNodeData;
  return (
    <div style={{ ...s.base, borderColor: '#ffb968', background: '#1a1408' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ ...s.tag, background: '#ffb968', color: '#0d0905' }}>⚡ 选择</div>
      {d.choices.map((c, i) => (
        <div key={i} style={s.choiceItem}>
          <span style={{ color: '#c9a14a', marginRight: 6 }}>{i + 1}.</span>
          {c.label}
          {c.set && Object.keys(c.set).length > 0 && (
            <span style={{ fontSize: 10, color: '#807060', marginLeft: 6 }}>
              → {Object.entries(c.set).map(([k, v]) => `${k}="${v}"`).join(', ')}
            </span>
          )}
        </div>
      ))}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// 跳转节点
export function GotoNode({ data }: NodeProps) {
  const d = data as GotoNodeData;
  const labels: Record<string, string> = {
    ch1: '→ 第一章', ch2: '→ 第二章', ch3: '→ 第三章', ch4: '→ 第四章',
    clue: '→ 线索调查', trust: '→ 托付选择', ending: '→ 结局',
  };
  const label = labels[d.target] || `→ ${d.target}`;
  const isEnding = d.target === 'ending';
  const bgColor = isEnding ? '#3a0a1a' : '#0a1a3a';
  const borderColor = isEnding ? '#c94a6b' : '#4a7ac9';

  return (
    <div style={{ ...s.base, borderColor, background: bgColor, textAlign: 'center' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontSize: 14, fontWeight: 700, color: isEnding ? '#ff8899' : '#7ab4ff' }}>
        {label}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// 结局节点
export function EndingNode({ data }: NodeProps) {
  const d = data as EndingNodeData;
  const colors: Record<string, string> = {
    ash: '#8a3a2a', sealed: '#6b5a2a', living: '#3a6b58',
  };
  const bg = colors[d.endingId] || '#2a2a2a';
  return (
    <div style={{ ...s.base, borderColor: bg, background: '#0d0905', minWidth: 200 }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ ...s.tag, background: bg, color: '#ebd9b3' }}>🏮 结局</div>
      <div style={{ fontWeight: 700, color: '#ffb968', marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: 11, color: '#806050' }}>{d.rank}</div>
    </div>
  );
}

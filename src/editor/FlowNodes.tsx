import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type {
  ChapterNodeData, NarrationNodeData, DialogueBlockNodeData,
  ChoiceNodeData, GotoNodeData, EndingNodeData,
} from './storyToFlow';
import { CHARACTERS } from '../data';

// ── token ─────────────────────────────────────────────────────────
const tok = {
  chapter:   { border: '#3b82f6', tag: '#1d4ed8' },
  narration: { border: '#94a3b8', tag: '#64748b' },
  dialogue:  { border: '#22c55e', tag: '#16a34a' },
  choice:    { border: '#f59e0b', tag: '#d97706' },
  goto:      { border: '#a855f7', tag: '#7c3aed' },
  ending:    { border: '#f43f5e', tag: '#be123c' },
};

// Ending ID → accent color
const endingColors: Record<string, string> = {
  chenbo_true:      '#22c55e',
  xuanyin_fallback: '#8b5cf6',
  wangji_trap:      '#f59e0b',
  burn_ending:      '#ef4444',
};

const card = (borderColor: string): React.CSSProperties => ({
  background: '#fff',
  borderRadius: '0 8px 8px 8px',
  border: `1.5px solid ${borderColor}`,
  minWidth: 230,
  maxWidth: 300,
  fontSize: 12,
  color: '#1e293b',
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  cursor: 'pointer',
  padding: '10px 12px',
});

const tagDiv = (bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center',
  background: bg, color: '#fff',
  borderRadius: '6px 6px 0 0',
  padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
});

const lc: React.CSSProperties = {
  color: '#475569', lineHeight: 1.5, fontSize: 12,
  overflow: 'hidden', display: '-webkit-box',
  WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const,
};

const hStyle = (color: string) => ({ background: color });

// ── 章节节点 ─────────────────────────────────────────────────────
export function ChapterNode({ data }: NodeProps) {
  const d = data as ChapterNodeData;
  return (
    <div>
      <div style={tagDiv(tok.chapter.tag)}>📚 章节</div>
      <div style={card(tok.chapter.border)}>
        <Handle type="target" position={Position.Left} style={hStyle(tok.chapter.border)} />
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 2 }}>{d.title}</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>scene: {d.scene} · {d.chapterId}</div>
        <Handle type="source" position={Position.Right} style={hStyle(tok.chapter.border)} />
      </div>
    </div>
  );
}

// ── 旁白节点 ─────────────────────────────────────────────────────
export function NarrationNode({ data }: NodeProps) {
  const d = data as NarrationNodeData;
  return (
    <div>
      <div style={tagDiv(tok.narration.tag)}>📜 旁白</div>
      <div style={card(tok.narration.border)}>
        <Handle type="target" position={Position.Left} style={hStyle(tok.narration.border)} />
        <div style={lc}>{d.line}</div>
        <Handle type="source" position={Position.Right} style={hStyle(tok.narration.border)} />
      </div>
    </div>
  );
}

// ── 对话块节点（多行对白合一） ─────────────────────────────────────
export function DialogueBlockNode({ data }: NodeProps) {
  const d = data as DialogueBlockNodeData;
  return (
    <div>
      <div style={tagDiv(tok.dialogue.tag)}>💬 对话</div>
      <div style={{ ...card(tok.dialogue.border), padding: 0, overflow: 'hidden' }}>
        <Handle type="target" position={Position.Left} style={hStyle(tok.dialogue.border)} />
        {d.lines.map((l, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, padding: '7px 12px',
            borderBottom: i < d.lines.length - 1 ? '1px solid #f0fdf4' : 'none',
            background: i % 2 === 0 ? '#fff' : '#f0fdf4',
            alignItems: 'flex-start',
          }}>
            <span style={{
              flexShrink: 0, fontSize: 10, fontWeight: 700, color: '#16a34a',
              background: '#dcfce7', borderRadius: 4, padding: '1px 6px',
              marginTop: 1, whiteSpace: 'nowrap',
            }}>{CHARACTERS[l.speaker]?.name ?? l.speaker}</span>
            <span style={{ color: '#334155', fontSize: 12, lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            }}>{l.line}</span>
          </div>
        ))}
        <Handle type="source" position={Position.Right} style={hStyle(tok.dialogue.border)} />
      </div>
    </div>
  );
}

// ── 选择分支节点 ─────────────────────────────────────────────────
export function ChoiceNode({ data }: NodeProps) {
  const d = data as ChoiceNodeData;
  return (
    <div>
      <div style={tagDiv(tok.choice.tag)}>⚡ 选择</div>
      <div style={card(tok.choice.border)}>
        <Handle type="target" position={Position.Left} style={hStyle(tok.choice.border)} />
        {d.choices.map((c, i) => (
          <div key={i} style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 5, padding: '4px 8px', marginTop: i === 0 ? 0 : 5, fontSize: 11, color: '#78350f',
          }}>
            <span style={{ color: '#d97706', fontWeight: 700, marginRight: 5 }}>{i + 1}.</span>
            {c.label}
            {c.set && Object.keys(c.set).length > 0 && (
              <div style={{ fontSize: 10, color: '#a16207', marginTop: 2 }}>
                → {Object.entries(c.set).map(([k, v]) => `${k}="${v}"`).join(', ')}
              </div>
            )}
          </div>
        ))}
        <Handle type="source" position={Position.Right} style={hStyle(tok.choice.border)} />
      </div>
    </div>
  );
}

// ── 跳转节点 ─────────────────────────────────────────────────────
export function GotoNode({ data }: NodeProps) {
  const d = data as GotoNodeData;
  const labels: Record<string, string> = {
    ch1: '→ 第一章', ch2: '→ 第二章', ch3: '→ 第三章', ch4: '→ 第四章', ch5: '→ 第五章',
    clue: '→ 线索调查', trust: '→ 托付选择', ending: '→ 结局',
  };
  return (
    <div>
      <div style={tagDiv(tok.goto.tag)}>→ 跳转</div>
      <div style={{ ...card(tok.goto.border), textAlign: 'center' }}>
        <Handle type="target" position={Position.Left} style={hStyle(tok.goto.border)} />
        <div style={{ fontWeight: 600, color: '#6d28d9' }}>{labels[d.target] ?? d.target}</div>
        <Handle type="source" position={Position.Right} style={hStyle(tok.goto.border)} />
      </div>
    </div>
  );
}

// ── 结局节点 ─────────────────────────────────────────────────────
export function EndingNode({ data }: NodeProps) {
  const d = data as EndingNodeData;
  const c = endingColors[d.endingId] ?? tok.ending.border;
  return (
    <div>
      <div style={tagDiv(c)}>🏮 结局</div>
      <div style={card(c)}>
        <Handle type="target" position={Position.Left} style={hStyle(c)} />
        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{d.name}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{d.rank}</div>
        <div style={{
          fontSize: 11, color: '#64748b', lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
        }}>{d.body}</div>
        <Handle type="source" position={Position.Right} style={hStyle(c)} />
      </div>
    </div>
  );
}

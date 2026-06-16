import type { Node } from '@xyflow/react';
import type {
  StoryNodeData, DialogueBlockNodeData, NarrationNodeData,
  ChoiceNodeData, GotoNodeData, ChapterNodeData, DialogueLine, EndingNodeData,
} from './storyToFlow';
import type { Choice } from '../data/types';
import { ENDINGS } from '../data';

interface Props {
  node: Node<StoryNodeData> | null;
  onChange: (nodeId: string, data: StoryNodeData) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

// ── 已知角色（key → 中文名） ──────────────────────────────────────
const SPEAKERS = [
  { id: 'huatuo',  name: '华佗' },
  { id: 'aj',      name: '阿吉' },
  { id: 'wangji',  name: '王济' },
  { id: 'chenbo',  name: '陈伯' },
  { id: 'xuanyin', name: '玄音' },
  { id: 'caocao',  name: '曹操' },
  { id: 'soldier', name: '士卒' },
];

// ── 场景 ID 列表（与 story.ts 保持一致） ─────────────────────────
const SCENES = [
  { value: 'xuchang_prison', label: 'xuchang_prison · 许昌牢狱' },
  { value: 'street_market',  label: 'street_market · 街市押解' },
  { value: 'cao_mansion',    label: 'cao_mansion · 曹府密谈' },
  { value: 'music_house',    label: 'music_house · 乐坊' },
  { value: 'old_shrine',     label: 'old_shrine · 旧祠堂' },
  { value: 'three_places',   label: 'three_places · 三人之试' },
  { value: 'huatuo_cell',    label: 'huatuo_cell · 华佗牢房' },
  { value: 'final_choice',   label: 'final_choice · 最终抉择' },
];

// ── 样式 token ────────────────────────────────────────────────────
const panel: React.CSSProperties = {
  position: 'fixed', top: 52, right: 0, width: 348, bottom: 0,
  background: '#fff', borderLeft: '1px solid #e2e8f0',
  overflowY: 'auto', zIndex: 100,
  boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b',
  marginBottom: 4, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5,
};

const inp: React.CSSProperties = {
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: 6, color: '#1e293b', padding: '7px 10px',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  userSelect: 'text', WebkitUserSelect: 'text',
} as React.CSSProperties;

const ta: React.CSSProperties = { ...inp, minHeight: 72, resize: 'vertical' };
const sel: React.CSSProperties = { ...inp, cursor: 'pointer' };
const roInp: React.CSSProperties = { ...inp, background: '#f1f5f9', color: '#94a3b8' };

const kindColor: Record<string, string> = {
  chapter: '#3b82f6', narration: '#64748b', dialogueBlock: '#22c55e',
  choice: '#f59e0b', goto: '#a855f7', ending: '#f43f5e',
};
const kindLabel: Record<string, string> = {
  chapter: '📚 章节', narration: '📜 旁白', dialogueBlock: '💬 对话块',
  choice: '⚡ 选择分支', goto: '→ 跳转', ending: '🏮 结局',
};

function Btn({ children, onClick, color = '#3b82f6', variant = 'outline' }: {
  children: React.ReactNode; onClick: () => void; color?: string; variant?: 'outline' | 'ghost';
}) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600,
      border: variant === 'outline' ? `1px solid ${color}` : 'none',
      color: variant === 'outline' ? color : '#94a3b8',
      background: variant === 'ghost' ? 'transparent' : '#fff',
    }}>{children}</button>
  );
}

// ── SpeakerInput: 下拉选已知角色（存 key），也可自由输入 ──────────
function SpeakerInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isKnown = SPEAKERS.some(s => s.id === value);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <select
        style={{ ...sel, flex: '0 0 auto', width: 130 }}
        value={isKnown ? value : '__custom'}
        onChange={e => {
          if (e.target.value !== '__custom') onChange(e.target.value);
        }}
      >
        {SPEAKERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        <option value="__custom">自定义…</option>
      </select>
      <input
        style={{ ...inp, flex: 1 }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="角色 key"
      />
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────
export default function NodePropsPanel({ node, onChange, onDelete, onClose }: Props) {
  if (!node) return null;
  const d = node.data;
  const color = kindColor[d.kind] ?? '#64748b';
  const upd = (patch: Partial<StoryNodeData>) =>
    onChange(node.id, { ...d, ...patch } as StoryNodeData);

  return (
    <div style={panel}>
      {/* 头部 */}
      <div style={{
        position: 'sticky', top: 0, background: '#fff',
        borderBottom: '1px solid #f1f5f9', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{kindLabel[d.kind] ?? d.kind}</span>
        </div>
        <button onClick={onClose} style={{
          padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0',
          background: '#fff', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
        }}>✕</button>
      </div>

      <div style={{ padding: '8px 16px 24px' }}>
        {/* ── 章节节点 ── */}
        {d.kind === 'chapter' && (() => {
          const cd = d as ChapterNodeData;
          return (<>
            <label style={lbl}>章节标题</label>
            <input style={inp} value={cd.title} onChange={e => upd({ title: e.target.value } as any)} />
            <label style={lbl}>场景 ID</label>
            <select style={sel} value={cd.scene} onChange={e => upd({ scene: e.target.value } as any)}>
              {SCENES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              {!SCENES.some(s => s.value === cd.scene) && (
                <option value={cd.scene}>{cd.scene}</option>
              )}
            </select>
            <label style={lbl}>章节 ID（只读）</label>
            <input style={roInp} value={cd.chapterId} readOnly />
          </>);
        })()}

        {/* ── 旁白节点 ── */}
        {d.kind === 'narration' && (() => {
          const nd = d as NarrationNodeData;
          return (<>
            <label style={lbl}>旁白内容</label>
            <textarea style={ta} value={nd.line} onChange={e => upd({ line: e.target.value } as any)} />
          </>);
        })()}

        {/* ── 对话块节点 ── */}
        {d.kind === 'dialogueBlock' && (() => {
          const bd = d as DialogueBlockNodeData;
          const setLines = (lines: DialogueLine[]) => upd({ lines } as any);

          return (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>对白列表</span>
              <Btn color="#22c55e" onClick={() => setLines([...bd.lines, { speaker: 'aj', line: '' }])}>
                + 添加对白
              </Btn>
            </div>

            {bd.lines.map((line, i) => (
              <div key={i} style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 6, padding: '10px 12px', marginTop: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>对白 {i + 1}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {i > 0 && (
                      <Btn variant="ghost" onClick={() => {
                        const nl = [...bd.lines];
                        [nl[i - 1], nl[i]] = [nl[i], nl[i - 1]];
                        setLines(nl);
                      }}>↑</Btn>
                    )}
                    {i < bd.lines.length - 1 && (
                      <Btn variant="ghost" onClick={() => {
                        const nl = [...bd.lines];
                        [nl[i], nl[i + 1]] = [nl[i + 1], nl[i]];
                        setLines(nl);
                      }}>↓</Btn>
                    )}
                    <button onClick={() => setLines(bd.lines.filter((_, idx) => idx !== i))} style={{
                      border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11,
                    }}>删除</button>
                  </div>
                </div>
                <label style={lbl}>角色</label>
                <SpeakerInput value={line.speaker} onChange={v => {
                  const nl = [...bd.lines]; nl[i] = { ...nl[i], speaker: v }; setLines(nl);
                }} />
                <label style={lbl}>对话内容</label>
                <textarea style={ta} value={line.line} onChange={e => {
                  const nl = [...bd.lines]; nl[i] = { ...nl[i], line: e.target.value }; setLines(nl);
                }} />
              </div>
            ))}
          </>);
        })()}

        {/* ── 选择分支节点 ── */}
        {d.kind === 'choice' && (() => {
          const cd = d as ChoiceNodeData;
          const setChoices = (choices: Choice[]) => upd({ choices } as any);
          return (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>选项列表</span>
              <Btn color="#f59e0b" onClick={() => setChoices([...cd.choices, { label: '新选项', toast: '', set: {} }])}>
                + 添加选项
              </Btn>
            </div>
            {cd.choices.map((choice, i) => (
              <div key={i} style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 6, padding: '10px 12px', marginTop: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>选项 {i + 1}</span>
                  <button onClick={() => setChoices(cd.choices.filter((_, idx) => idx !== i))} style={{
                    border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11,
                  }}>删除</button>
                </div>
                <label style={lbl}>选项文本</label>
                <input style={inp} value={choice.label}
                  onChange={e => { const nc = [...cd.choices]; nc[i] = { ...nc[i], label: e.target.value }; setChoices(nc); }} />
                <label style={lbl}>Toast 提示（可选）</label>
                <input style={inp} value={choice.toast ?? ''}
                  onChange={e => { const nc = [...cd.choices]; nc[i] = { ...nc[i], toast: e.target.value || undefined }; setChoices(nc); }} />
                <label style={lbl}>状态变更（key=value，逗号分隔）</label>
                <input style={inp} placeholder="trust_huatuo=20, firstImpression=loyal"
                  value={choice.set ? Object.entries(choice.set).map(([k, v]) => `${k}=${v}`).join(', ') : ''}
                  onChange={e => {
                    const set: Record<string, string> = {};
                    e.target.value.split(',').forEach(pair => {
                      const eq = pair.indexOf('=');
                      if (eq > 0) {
                        const k = pair.slice(0, eq).trim();
                        const v = pair.slice(eq + 1).trim();
                        if (k) set[k] = v;
                      }
                    });
                    const nc = [...cd.choices]; nc[i] = { ...nc[i], set }; setChoices(nc);
                  }} />
                <label style={lbl}>结局 ID（可选）</label>
                <select style={sel} value={choice.ending ?? ''}
                  onChange={e => {
                    const nc = [...cd.choices];
                    nc[i] = { ...nc[i], ending: (e.target.value as any) || undefined };
                    setChoices(nc);
                  }}>
                  <option value="">— 无 —</option>
                  {Object.values(ENDINGS).map(e => (
                    <option key={e.id} value={e.id}>{e.id} · {e.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </>);
        })()}

        {/* ── 跳转节点 ── */}
        {d.kind === 'goto' && (() => {
          const gd = d as GotoNodeData;
          return (<>
            <label style={lbl}>跳转目标</label>
            <select style={sel} value={gd.target} onChange={e => upd({ target: e.target.value } as any)}>
              {['ch1','ch2','ch3','ch4','ch5','trust','ending'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </>);
        })()}

        {/* ── 结局节点（只读展示） ── */}
        {d.kind === 'ending' && (() => {
          const ed = d as EndingNodeData;
          return (<>
            <div style={{
              background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6,
              padding: '8px 10px', fontSize: 11, color: '#9a3412', marginTop: 8,
            }}>
              结局数据来自 <code>endings.ts</code>，此处只读。如需修改请直接编辑源文件。
            </div>
            <label style={lbl}>结局 ID</label>
            <input style={roInp} value={ed.endingId} readOnly />
            <label style={lbl}>结局名称</label>
            <input style={roInp} value={ed.name} readOnly />
            <label style={lbl}>评级</label>
            <input style={roInp} value={ed.rank} readOnly />
            <label style={lbl}>正文摘要</label>
            <textarea style={{ ...roInp, minHeight: 80, resize: 'none' } as any} value={ed.body} readOnly />
          </>);
        })()}

        <div style={{ marginTop: 20, padding: '7px 10px', background: '#f8fafc', borderRadius: 6 }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>id: {node.id}</span>
        </div>

        {/* 删除按钮（章节和结局节点不可删除） */}
        {d.kind !== 'chapter' && d.kind !== 'ending' && (
          <button
            onClick={() => {
              if (window.confirm('确认删除此节点？此操作无法撤销。')) {
                onDelete(node.id);
              }
            }}
            style={{
              marginTop: 12, width: '100%', padding: '8px', borderRadius: 6,
              border: '1px solid #fecaca', background: '#fff',
              color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            🗑 删除此节点
          </button>
        )}
      </div>
    </div>
  );
}

import type { Node } from '@xyflow/react';
import type {
  StoryNodeData, DialogueBlockNodeData, NarrationNodeData,
  ChoiceNodeData, GotoNodeData, ChapterNodeData, DialogueLine,
} from './storyToFlow';
import type { Choice } from '../data/types';

interface Props {
  node: Node<StoryNodeData> | null;
  onChange: (nodeId: string, data: StoryNodeData) => void;
  onClose: () => void;
}

// ── 已知角色列表 ─────────────────────────────────────────────────
const SPEAKERS = ['华佗', '徒弟', '大徒儿·吴普', '旁白', '阿瑶', '老栾', '老周'];

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
};

const ta: React.CSSProperties = { ...inp, minHeight: 72, resize: 'vertical' };
const sel: React.CSSProperties = { ...inp, cursor: 'pointer' };

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

// ── SpeakerInput: 下拉 + 自定义输入 ──────────────────────────────
function SpeakerInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <select
        style={{ ...sel, flex: '0 0 auto', width: 120 }}
        value={SPEAKERS.includes(value) ? value : '__custom'}
        onChange={e => {
          if (e.target.value !== '__custom') onChange(e.target.value);
        }}
      >
        {SPEAKERS.map(s => <option key={s} value={s}>{s}</option>)}
        <option value="__custom">自定义…</option>
      </select>
      <input
        style={{ ...inp, flex: 1 }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="角色名"
      />
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────
export default function NodePropsPanel({ node, onChange, onClose }: Props) {
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
              <option value="clinic_night">clinic_night · 医馆夜景</option>
              <option value="raid_coming">raid_coming · 搜查将至</option>
              <option value="find_trust">find_trust · 寻找托付</option>
              <option value="final_choice">final_choice · 最终抉择</option>
            </select>
            <label style={lbl}>章节 ID（只读）</label>
            <input style={{ ...inp, background: '#f1f5f9', color: '#94a3b8' }} value={cd.chapterId} readOnly />
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
              <Btn color="#22c55e" onClick={() => setLines([...bd.lines, { speaker: '华佗', line: '' }])}>
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
                <label style={lbl}>Toast 提示</label>
                <input style={inp} value={choice.toast ?? ''}
                  onChange={e => { const nc = [...cd.choices]; nc[i] = { ...nc[i], toast: e.target.value }; setChoices(nc); }} />
                <label style={lbl}>状态变更（key=value，逗号分隔）</label>
                <input style={inp} placeholder="firstChoice=trust, ch2=hide"
                  value={choice.set ? Object.entries(choice.set).map(([k, v]) => `${k}=${v}`).join(', ') : ''}
                  onChange={e => {
                    const set: Record<string, string> = {};
                    e.target.value.split(',').forEach(pair => {
                      const [k, v] = pair.split('=').map(s => s.trim());
                      if (k && v !== undefined) set[k] = v;
                    });
                    const nc = [...cd.choices]; nc[i] = { ...nc[i], set }; setChoices(nc);
                  }} />
                <label style={lbl}>结局 ID（可选）</label>
                <select style={sel} value={choice.ending ?? ''}
                  onChange={e => { const nc = [...cd.choices]; nc[i] = { ...nc[i], ending: (e.target.value as any) || undefined }; setChoices(nc); }}>
                  <option value="">— 无 —</option>
                  <option value="ash">ash · 原卷成灰</option>
                  <option value="sealed">sealed · 密室封存</option>
                  <option value="living">living · 医道未断</option>
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
              {['ch1','ch2','ch3','ch4','clue','trust','ending'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </>);
        })()}

        <div style={{ marginTop: 20, padding: '7px 10px', background: '#f8fafc', borderRadius: 6 }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>id: {node.id}</span>
        </div>
      </div>
    </div>
  );
}

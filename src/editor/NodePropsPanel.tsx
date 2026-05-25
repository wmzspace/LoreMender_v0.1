import type { Node } from '@xyflow/react';
import type { StoryNodeData, DialogueNodeData, NarrationNodeData, ChoiceNodeData, GotoNodeData, ChapterNodeData } from './storyToFlow';
import type { Choice } from '../data/types';

interface Props {
  node: Node<StoryNodeData> | null;
  onChange: (nodeId: string, data: StoryNodeData) => void;
  onClose: () => void;
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: 360,
  height: '100vh',
  background: '#0f0c08',
  borderLeft: '2px solid #c9a14a',
  padding: '24px 20px',
  overflowY: 'auto',
  zIndex: 100,
  boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#806040',
  marginBottom: 4,
  marginTop: 14,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1208',
  border: '1px solid #5a4a2a',
  borderRadius: 6,
  color: '#ebd9b3',
  padding: '8px 10px',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

const taStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 80,
  resize: 'vertical',
  fontFamily: 'inherit',
};

const sectionTitle: React.CSSProperties = {
  color: '#c9a14a',
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 10,
  borderBottom: '1px solid #3a2a10',
  paddingBottom: 8,
};

const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};

const kindLabels: Record<string, string> = {
  chapter: '📚 章节', narration: '📜 旁白', dialogue: '💬 对话',
  choice: '⚡ 选择分支', goto: '→ 跳转', ending: '🏮 结局',
};

export default function NodePropsPanel({ node, onChange, onClose }: Props) {
  if (!node) return null;
  const d = node.data;
  const update = (patch: Partial<StoryNodeData>) =>
    onChange(node.id, { ...d, ...patch } as StoryNodeData);

  return (
    <div style={panelStyle}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={sectionTitle}>{kindLabels[d.kind] ?? d.kind}</div>
        <button onClick={onClose} style={{ ...btnStyle, background: '#3a1a10', color: '#ff8080' }}>✕ 关闭</button>
      </div>

      {/* 章节节点 */}
      {d.kind === 'chapter' && (() => {
        const cd = d as ChapterNodeData;
        return (
          <>
            <label style={label}>章节标题</label>
            <input style={inputStyle} value={cd.title}
              onChange={e => update({ title: e.target.value } as any)} />
            <label style={label}>场景 ID</label>
            <input style={inputStyle} value={cd.scene}
              onChange={e => update({ scene: e.target.value } as any)} />
            <label style={label}>章节 ID（只读）</label>
            <input style={{ ...inputStyle, opacity: 0.5 }} value={cd.chapterId} readOnly />
          </>
        );
      })()}

      {/* 旁白节点 */}
      {d.kind === 'narration' && (() => {
        const nd = d as NarrationNodeData;
        return (
          <>
            <label style={label}>旁白内容</label>
            <textarea style={taStyle} value={nd.line}
              onChange={e => update({ line: e.target.value } as any)} />
          </>
        );
      })()}

      {/* 对话节点 */}
      {d.kind === 'dialogue' && (() => {
        const dd = d as DialogueNodeData;
        return (
          <>
            <label style={label}>说话人</label>
            <input style={inputStyle} value={dd.speaker}
              onChange={e => update({ speaker: e.target.value } as any)} />
            <label style={label}>对话内容</label>
            <textarea style={taStyle} value={dd.line}
              onChange={e => update({ line: e.target.value } as any)} />
          </>
        );
      })()}

      {/* 选择分支节点 */}
      {d.kind === 'choice' && (() => {
        const cd = d as ChoiceNodeData;
        const setChoices = (choices: Choice[]) => update({ choices } as any);
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#c9a14a', fontSize: 13 }}>选项列表</span>
              <button
                style={{ ...btnStyle, background: '#1a3a1a', color: '#80ff80' }}
                onClick={() => setChoices([...cd.choices, { label: '新选项', toast: '', set: {} }])}
              >+ 添加选项</button>
            </div>
            {cd.choices.map((choice, i) => (
              <div key={i} style={{ background: '#1a1208', border: '1px solid #3a2a10', borderRadius: 6, padding: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#c9a14a', fontSize: 12, fontWeight: 700 }}>选项 {i + 1}</span>
                  <button
                    style={{ ...btnStyle, background: '#3a0a0a', color: '#ff6060', padding: '2px 8px' }}
                    onClick={() => setChoices(cd.choices.filter((_, idx) => idx !== i))}
                  >删除</button>
                </div>
                <label style={label}>选项文本</label>
                <input style={inputStyle} value={choice.label}
                  onChange={e => {
                    const nc = [...cd.choices];
                    nc[i] = { ...nc[i], label: e.target.value };
                    setChoices(nc);
                  }} />
                <label style={label}>Toast 提示</label>
                <input style={inputStyle} value={choice.toast ?? ''}
                  onChange={e => {
                    const nc = [...cd.choices];
                    nc[i] = { ...nc[i], toast: e.target.value };
                    setChoices(nc);
                  }} />
                <label style={label}>状态变更（key=value，逗号分隔）</label>
                <input style={inputStyle}
                  value={choice.set ? Object.entries(choice.set).map(([k, v]) => `${k}=${v}`).join(', ') : ''}
                  placeholder="例如: firstChoice=trust, ch2=hide"
                  onChange={e => {
                    const set: Record<string, string> = {};
                    e.target.value.split(',').forEach(pair => {
                      const [k, v] = pair.split('=').map(s => s.trim());
                      if (k && v) set[k] = v;
                    });
                    const nc = [...cd.choices];
                    nc[i] = { ...nc[i], set };
                    setChoices(nc);
                  }} />
                <label style={label}>结局 ID（可选，ash/sealed/living）</label>
                <input style={inputStyle} value={choice.ending ?? ''}
                  onChange={e => {
                    const nc = [...cd.choices];
                    nc[i] = { ...nc[i], ending: e.target.value as any || undefined };
                    setChoices(nc);
                  }} />
              </div>
            ))}
          </>
        );
      })()}

      {/* 跳转节点 */}
      {d.kind === 'goto' && (() => {
        const gd = d as GotoNodeData;
        return (
          <>
            <label style={label}>跳转目标</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}
              value={gd.target}
              onChange={e => update({ target: e.target.value } as any)}>
              <option value="ch1">ch1 - 第一章</option>
              <option value="ch2">ch2 - 第二章</option>
              <option value="ch3">ch3 - 第三章</option>
              <option value="ch4">ch4 - 第四章</option>
              <option value="clue">clue - 线索调查</option>
              <option value="trust">trust - 托付选择</option>
              <option value="ending">ending - 结局</option>
            </select>
          </>
        );
      })()}

      <div style={{ marginTop: 24, fontSize: 11, color: '#604030' }}>
        节点 ID：{node.id}
      </div>
    </div>
  );
}

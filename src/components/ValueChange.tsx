import { useEffect, useRef, type CSSProperties } from "react";
import { playSfx } from "../lib/audio";

/** 单条数值变化提示（《底特律：变人》式：右上角角色名 + 横线 + 状态词 + 升降箭头）。 */
export interface ValueDelta {
  id: string;        // 唯一 key，便于 React 列表与去重
  subject: string;   // 对象，如「陈伯」「歌诀传播」
  facet: string;     // 维度，如「信任」「倾向」「压力」
  dir: 1 | -1;       // 升 / 降
  tone: "good" | "bad" | "neutral"; // 配色基调
  level: string;     // 当前状态词，如「中立」「信重」
}

type ValueKind = "trust" | "bond" | "tendency" | "pressure" | "skill";

/** 跟踪键 → 展示元数据。 */
export const VALUE_META: Record<string, { subject: string; facet: string; kind: ValueKind; risingTone: "good" | "bad" | "neutral" }> = {
  huatuo_trust:     { subject: "华佗", facet: "羁绊", kind: "bond", risingTone: "good" },
  chenbo_trust:     { subject: "陈伯", facet: "信任", kind: "trust", risingTone: "good" },
  wangji_trust:     { subject: "王济", facet: "信任", kind: "trust", risingTone: "good" },
  xuanyin_trust:    { subject: "玄音", facet: "信任", kind: "trust", risingTone: "good" },
  record_tendency:  { subject: "民间留存", facet: "倾向", kind: "tendency", risingTone: "good" },
  system_tendency:  { subject: "制度存档", facet: "倾向", kind: "tendency", risingTone: "good" },
  spread_tendency:  { subject: "歌诀传播", facet: "倾向", kind: "tendency", risingTone: "good" },
  burn_tendency:    { subject: "焚毁残卷", facet: "倾向", kind: "tendency", risingTone: "bad" },
  medical_skill:    { subject: "医术", facet: "造诣", kind: "skill", risingTone: "good" },
  asked_heart:      { subject: "问心", facet: "心境", kind: "skill", risingTone: "good" },
  searchPressure:   { subject: "搜查", facet: "压力", kind: "pressure", risingTone: "bad" },
};

/** 把当前数值映射成一个状态词，模仿《底特律》的「中立 / 友好」式关系标签。 */
function levelWord(kind: ValueKind, value: number): string {
  const v = Number(value || 0);
  switch (kind) {
    // 信任为累加值（小游戏 ±1 + 共情对白 ±1），范围约 -2..+3
    case "trust":    return v >= 2 ? "信重" : v >= 1 ? "渐信" : v <= -1 ? "生隙" : "中立";
    case "bond":     return v >= 3 ? "知己" : v >= 2 ? "相契" : v >= 1 ? "渐近" : "疏离";
    case "tendency": return v >= 2 ? "笃定" : v >= 1 ? "倾斜" : "未明";
    case "pressure": return v >= 5 ? "临界" : v >= 3 ? "紧逼" : v >= 1 ? "渐起" : "平静";
    case "skill":    return v >= 3 ? "精进" : v >= 2 ? "渐成" : v >= 1 ? "入门" : v <= -1 ? "生疏" : "平平";
  }
}

/** 比较新旧状态，得出需要提示的数值变化列表。 */
export function diffValues(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
  stamp: number,
): ValueDelta[] {
  const out: ValueDelta[] = [];
  for (const key of Object.keys(VALUE_META)) {
    const a = Number(prev[key] || 0);
    const b = Number(next[key] || 0);
    if (b === a) continue;
    const meta = VALUE_META[key];
    const dir: 1 | -1 = b > a ? 1 : -1;
    const tone = dir === 1
      ? meta.risingTone
      : meta.risingTone === "good" ? "bad" : meta.risingTone === "bad" ? "good" : "neutral";
    out.push({
      id: `${key}-${stamp}`,
      subject: meta.subject,
      facet: meta.facet,
      dir,
      tone,
      level: levelWord(meta.kind, b),
    });
  }
  return out;
}

interface ValueChangeStackProps {
  deltas: ValueDelta[];
  onClear: () => void;
}

/** 右上角纵向堆叠的数值变化提示，约 4s 后整体淡出。 */
export function ValueChangeStack({ deltas, onClear }: ValueChangeStackProps) {
  // onClear 用 ref 持有最新引用，避免它作为 effect 依赖，
  // 否则父组件每次重渲染（打字机/音频等）都会重置定时器，使提示要么提前消失要么永不消失。
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;
  // 仅以「内容签名」作为依赖：只有真正出现新一批数值变化时才重启定时器。
  const sig = deltas.map(d => d.id).join("|");

  useEffect(() => {
    if (!sig) return;
    playSfx("tap");
    const t = window.setTimeout(() => onClearRef.current(), 4000);
    return () => window.clearTimeout(t);
  }, [sig]);

  if (!deltas.length) return null;
  return (
    <div className="value-change-stack" aria-live="polite">
      {deltas.map((d, i) => (
        <div
          key={d.id}
          className={`value-change-card tone-${d.tone}`}
          style={{ "--vc-stagger": `${i * 110}ms` } as CSSProperties}
        >
          <div className="vc-subject">{d.subject}</div>
          <div className="vc-meter">
            <span className="vc-line" />
            <span className="vc-arrow">{d.dir === 1 ? "▲" : "▼"}</span>
          </div>
          <div className="vc-bottom">
            <span className="vc-facet">{d.facet}</span>
            <span className="vc-level">{d.level}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

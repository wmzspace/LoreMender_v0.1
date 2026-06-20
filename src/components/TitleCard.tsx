import { useEffect, useRef, useState, type ReactNode } from "react";

/** 每张卡停留时长（含文字淡入/停留/淡出）。 */
const CARD_MS = 2600;
/** 整段过场首尾黑底淡入/淡出时长。 */
const FADE_MS = 360;

interface TitleSequenceProps {
  /** 依次播放的卡片内容（每项为卡内文字/图层，外层黑底由本组件统一持有）。 */
  cards: ReactNode[];
  /** 全部播完（或轻触跳过最后一张）后回调。 */
  onDone: () => void;
}

/**
 * 开场过场序列：整段只有一层持续的黑底——开头淡入一次、结尾淡出一次，
 * 中间仅切换卡内文字。如此连续两张卡之间黑底不消失，不会闪出底下场景。
 * 每张卡停留 ~2.6s，可轻触跳到下一张 / 结束。
 */
export function TitleSequence({ cards, onDone }: TitleSequenceProps) {
  const [i, setI] = useState(0);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  const finishOut = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    window.setTimeout(onDone, FADE_MS);
  };

  const next = () => {
    if (doneRef.current) return;
    if (i < cards.length - 1) setI(i + 1);
    else finishOut();
  };

  useEffect(() => {
    if (exiting) return;
    const t = window.setTimeout(next, CARD_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, exiting]);

  return (
    <div
      className={"title-card title-card--seq" + (exiting ? " is-exiting" : "")}
      onClick={next}
      role="button"
      aria-label="轻触跳过"
    >
      {/* key={i} 让卡内随索引变化而重挂载，重新播放文字淡入/淡出；黑底不动 */}
      <div key={i} className="title-seq-card">{cards[i]}</div>
    </div>
  );
}

/** 标题卡内容（小标签 + 金线 + 主标题）。供 TitleSequence 的 cards 使用。 */
export function titleCardContent(eyebrow: string, title: string): ReactNode {
  return (
    <>
      <div className="title-card-eyebrow">{eyebrow}</div>
      <div className="title-card-rule" />
      <div className="title-card-title">{title}</div>
    </>
  );
}

/** 工作室署名卡内容（透明 logo + 小字「出品」）。logo 自带「拾遗工作室」字样，故不再重复大字。 */
export function studioCardContent(): ReactNode {
  return (
    <>
      <img className="studio-card-logo" src="/images/logo_studio.webp" alt="拾遗工作室" />
      <div className="studio-card-sub">出 品</div>
    </>
  );
}

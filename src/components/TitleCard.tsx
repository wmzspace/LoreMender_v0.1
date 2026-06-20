import { useEffect, useRef } from "react";

interface TitleCardProps {
  /** 上方小字标签，如「序 幕」「第 一 卷 · 青 囊 残 卷」。 */
  eyebrow: string;
  /** 主标题，如「典 故 修 补 者」「许 昌 大 牢」。 */
  title: string;
  /** 动画结束（或轻触跳过）后回调。 */
  onDone: () => void;
}

/**
 * 开场标题卡：黑屏 → 标题淡入停留 → 淡出，约 2.6s 后回调；可轻触跳过。
 * 用于进入序幕与每一章（卷）时的过场动画。
 */
export function TitleCard({ eyebrow, title, onDone }: TitleCardProps) {
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const t = window.setTimeout(finish, 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="title-card" onClick={finish} role="button" aria-label="轻触跳过">
      <div className="title-card-inner">
        <div className="title-card-eyebrow">{eyebrow}</div>
        <div className="title-card-rule" />
        <div className="title-card-title">{title}</div>
      </div>
    </div>
  );
}

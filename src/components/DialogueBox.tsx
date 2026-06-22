import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface DialogueBoxHandle {
  /** 推进对白:未打完则立即显示全文,已打完则进入下一句。供场景插图点击复用。 */
  advance: () => void;
}

interface DialogueBoxProps {
  speaker?: string | null;
  /** 说话人方形头像(CHARACTERS[*].portrait)。 */
  portrait?: string | null;
  text: string;
  isNarration?: boolean;
  onTap?: () => void;
  onNext?: () => void;
  /** 自动播放开关态。 */
  autoOn?: boolean;
  onToggleAuto?: () => void;
  /** 打开历史浮层。 */
  onOpenLog?: () => void;
  /** 菜单(进程)入口,移动端显示。 */
  onMenu?: () => void;
  /** 打字机显示完毕时通知一次(供自动播放定时)。 */
  onTypingDone?: () => void;
}

/* —— galgame 控制条图标 —— */
function IconAuto() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 5.5 L11 8 L6.5 10.5 Z" fill="currentColor"/></svg>;
}
function IconLog() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3.5 H13 M3 8 H13 M3 12.5 H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IconMenu() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4 H13 M3 8 H13 M3 12 H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export const DialogueBox = forwardRef<DialogueBoxHandle, DialogueBoxProps>(function DialogueBox({
  speaker, portrait, text, isNarration, onTap, onNext,
  autoOn, onToggleAuto, onOpenLog, onMenu, onTypingDone,
}, ref) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number>(0);
  const doneRef = useRef(false);

  const finish = () => {
    window.clearInterval(intervalRef.current);
    setCount(text.length);
    setDone(true);
    if (!doneRef.current) {
      doneRef.current = true;
      onTypingDone?.();
    }
  };

  useEffect(() => {
    setCount(0);
    setDone(false);
    doneRef.current = false;
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i++;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(intervalRef.current);
        setDone(true);
        if (!doneRef.current) {
          doneRef.current = true;
          onTypingDone?.();
        }
      }
    }, 26);
    return () => window.clearInterval(intervalRef.current);
    // onTypingDone 故意不入依赖:避免父级每帧新函数重启打字机
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const advance = () => {
    if (!done) { finish(); return; }
    if (onNext) onNext();
    else onTap?.();
  };

  useImperativeHandle(ref, () => ({ advance }));

  // 控制条按钮点击不应冒泡到正文的「轻触继续」
  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  const textStyle: React.CSSProperties = {
    whiteSpace: "pre-line",
    fontStyle: isNarration ? "italic" : "normal",
    color: isNarration ? "rgba(228,224,208,0.9)" : "var(--paper)",
  };

  // 完整文本始终参与布局:已显示部分正常着色,未显示部分透明占位,避免回流抖动。
  const shown = text.slice(0, count);
  const rest = text.slice(count);

  return (
    // 整个对白框(含头像名条、控制条按钮之间的空隙)都能点击推进——
    // 之前只有 .gd-body 绑了 onClick,点名条/头像或控制条按钮间的空白会没反应。
    // 控制条上各按钮自带 stop() 做 stopPropagation,不会被这里重复触发。
    <div className="galgame-dialogue fade-in" data-sfx="tap" onClick={advance} style={{ cursor: "pointer" }}>
      {speaker && !isNarration && (
        <div className="gd-namebar">
          {portrait && <img className="gd-avatar" src={portrait} alt="" />}
          <span className="gd-name">{speaker}</span>
        </div>
      )}

      <div className="gd-body">
        <div className="gd-text" style={textStyle}>
          <span>{shown}</span>
          <span aria-hidden="true" style={{ opacity: 0 }}>{rest}</span>
          {done && <span className="gd-caret">▾</span>}
        </div>
      </div>

      <div className="gd-ctrl">
        <button className={"gd-btn" + (autoOn ? " active" : "")} onClick={stop(onToggleAuto)} aria-pressed={autoOn} aria-label="自动播放" title="自动播放"><IconAuto /></button>
        <button className="gd-btn" onClick={stop(onOpenLog)} aria-label="历史记录" title="历史记录"><IconLog /></button>
        {onMenu && <button className="gd-btn gd-btn--menu" onClick={stop(onMenu)} aria-label="副本进程" title="副本进程"><IconMenu /></button>}
      </div>
    </div>
  );
});

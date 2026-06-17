import { useEffect, useRef, useState } from "react";

interface DialogueBoxProps {
  speaker?: string | null;
  text: string;
  isNarration?: boolean;
  onTap?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function DialogueBox({ speaker, text, isNarration, onTap, onNext }: DialogueBoxProps) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    setCount(0);
    setDone(false);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i++;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(intervalRef.current);
        setDone(true);
      }
    }, 26);
    return () => window.clearInterval(intervalRef.current);
  }, [text]);

  const onClick = () => {
    if (!done) {
      window.clearInterval(intervalRef.current);
      setCount(text.length);
      setDone(true);
      return;
    }
    if (onNext) onNext();
    else onTap?.();
  };

  const textStyle: React.CSSProperties = {
    whiteSpace: "pre-line",
    fontStyle: isNarration ? "italic" : "normal",
    color: isNarration ? "rgba(228,224,208,0.85)" : "var(--paper)",
  };

  // 完整文本始终参与布局：已显示部分正常着色，未显示部分透明占位。
  // 这样换行与高度恒等于最终布局，逐字只是「显形」，不会回流、抖动或闪烁。
  const shown = text.slice(0, count);
  const rest = text.slice(count);

  return (
    <div className="dialogue" data-sfx="tap" onClick={onClick} style={{ cursor: "pointer" }}>
      {speaker && !isNarration && <div className="dialogue-name">{speaker}</div>}
      <div className="dialogue-text">
        <div style={textStyle}>
          <span>{shown}</span>
          <span aria-hidden="true" style={{ opacity: 0 }}>{rest}</span>
          {done && (
            <span style={{
              display: "inline-block",
              marginLeft: 6,
              color: "var(--gold-pale)",
              animation: "glowPulse 1.4s ease-in-out infinite",
            }}>▾</span>
          )}
        </div>
      </div>
    </div>
  );
}

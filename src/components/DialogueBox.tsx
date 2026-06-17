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
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(intervalRef.current);
        setDone(true);
      }
    }, 26);
    return () => window.clearInterval(intervalRef.current);
  }, [text]);

  const onClick = () => {
    if (!done) {
      // 动画进行中：清除 interval，直接显示完整文本
      window.clearInterval(intervalRef.current);
      setShown(text);
      setDone(true);
      return;
    }
    // 动画已完成：前进
    if (onNext) onNext();
    else onTap?.();
  };

  return (
    <div className="dialogue" data-sfx="tap" onClick={onClick} style={{ cursor: "pointer" }}>
      {speaker && !isNarration && <div className="dialogue-name">{speaker}</div>}
      <div className="dialogue-text" style={{
        whiteSpace: "pre-line",
        fontStyle: isNarration ? "italic" : "normal",
        color: isNarration ? "rgba(228,224,208,0.85)" : "var(--paper)",
      }}>
        {shown}
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
  );
}

import { useEffect, useState, type MouseEvent } from "react";

interface DialogueBoxProps {
  speaker?: string | null;
  text: string;
  isNarration?: boolean;
  onTap?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function DialogueBox({ speaker, text, isNarration, onTap, onPrev, onNext }: DialogueBoxProps) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, 26);
    return () => window.clearInterval(id);
  }, [text]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!done) {
      setShown(text);
      setDone(true);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX - rect.left < rect.width / 2;
    if (isLeft && onPrev) onPrev();
    else if (!isLeft && onNext) onNext();
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

import { useEffect, useState } from "react";

interface DialogueBoxProps {
  speaker?: string | null;
  text: string;
  isNarration?: boolean;
  onTap?: () => void;
}

export function DialogueBox({ speaker, text, isNarration, onTap }: DialogueBoxProps) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 26);
    return () => clearInterval(id);
  }, [text]);

  const onClick = () => {
    if (!done) {
      setShown(text);
      setDone(true);
    } else {
      onTap?.();
    }
  };

  return (
    <div className="dialogue" onClick={onClick} style={{cursor:"pointer"}}>
      {speaker && !isNarration && (
        <div className="dialogue-name">{speaker}</div>
      )}
      <div className="dialogue-text" style={{
        whiteSpace: "pre-line",
        fontStyle: isNarration ? "italic" : "normal",
        color: isNarration ? "rgba(228,224,208,0.85)" : "var(--paper)",
      }}>
        {shown}
        {done && (
          <span style={{
            display: "inline-block", marginLeft: 6, color: "var(--gold-pale)",
            animation: "glowPulse 1.4s ease-in-out infinite",
          }}>▾</span>
        )}
      </div>
    </div>
  );
}

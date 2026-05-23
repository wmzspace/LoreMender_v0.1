import { useEffect } from "react";

interface ToastProps {
  text: string;
  onDone: () => void;
}

export function Toast({ text, onDone }: ToastProps) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [text, onDone]);
  if (!text) return null;
  return <div className="toast">{text}</div>;
}

import type { ReactNode } from "react";

interface TopbarProps {
  title: ReactNode;
  onBack: () => void;
  right?: ReactNode;
}

export function Topbar({ title, onBack, right }: TopbarProps) {
  return (
    <div className="topbar">
      <button className="icon-btn press" data-sfx="back" onClick={onBack} aria-label="返回">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="topbar-title">{title}</div>
      <div style={{minWidth: 38, display:"flex", justifyContent:"flex-end", gap: 6}}>{right}</div>
    </div>
  );
}

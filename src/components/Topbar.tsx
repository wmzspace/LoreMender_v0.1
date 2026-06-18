import type { ReactNode } from "react";

interface TopbarProps {
  title: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  /** 强制隐藏返回按钮(极少用;一般由 CSS 在桌面端自动隐藏 .topbar-back)。 */
  hideBack?: boolean;
}

export function Topbar({ title, onBack, right, hideBack }: TopbarProps) {
  return (
    <div className="topbar">
      {hideBack || !onBack ? (
        <span className="topbar-back-placeholder" style={{ width: 38, flexShrink: 0 }} />
      ) : (
        <button className="icon-btn press topbar-back" data-sfx="back" onClick={onBack} aria-label="返回">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div className="topbar-title">{title}</div>
      <div style={{minWidth: 38, display:"flex", justifyContent:"flex-end", gap: 6}}>{right}</div>
    </div>
  );
}

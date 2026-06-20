import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PageKey } from "../lib/routes";

interface QuickMenuProps {
  active?: PageKey;
  onNav: (key: PageKey) => void;
}

interface QuickItem {
  key: PageKey;
  label: string;
  desc: string;
  /** 占位插图：后续替换为真实插画。 */
  art: ReactNode;
}

/**
 * 右上角快捷菜单：把「副本进程 / 线索板 / 结局图鉴」从侧栏收进一个菜单按钮，
 * 点击展开带插图占位的三个选项。插图区为【占位】，后续替换为正式插画即可。
 */
export function QuickMenu({ active, onNav }: QuickMenuProps) {
  const [open, setOpen] = useState(false);
  // 悬停展开、移开后延时收缩：延时避免指针在按钮与浮层间移动时误关闭。
  const closeTimer = useRef<number>(0);
  const cancelClose = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = 0; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => cancelClose, []);

  // 打开时按 Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items: QuickItem[] = [
    { key: "map", label: "副本进程", desc: "查看当前进度与节点", art: <ArtNode /> },
    { key: "clue", label: "线索板", desc: "已收集的线索与物证", art: <ArtClue /> },
    { key: "gallery", label: "结局图鉴", desc: "已解锁的结局收藏", art: <ArtSeal /> },
  ];

  const choose = (key: PageKey) => { cancelClose(); setOpen(false); onNav(key); };

  return (
    <div
      className="quick-menu"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        className={"icon-btn press" + (open ? " is-open" : "")}
        data-sfx="nav"
        onClick={() => setOpen(o => !o)}
        aria-label="快捷菜单"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="quick-menu-panel" role="menu">
          <div className="quick-menu-eyebrow">速 览</div>
          {items.map(it => (
            <button
              key={it.key}
              role="menuitem"
              className={"quick-menu-item press" + (active === it.key ? " active" : "")}
              data-sfx="nav"
              onClick={() => choose(it.key)}
            >
              <span className="quick-menu-art" aria-hidden="true">
                {it.art}
                <span className="quick-menu-art-tag">插图占位</span>
              </span>
              <span className="quick-menu-text">
                <span className="quick-menu-label">{it.label}</span>
                <span className="quick-menu-desc">{it.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* —— 占位插图（沿用金色描边线性风格） —— */
function ArtNode() {
  return (
    <svg width="34" height="34" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="4" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 4.6 L10.5 7.4 M10.5 8.6 L5.5 11.4" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
function ArtClue() {
  return (
    <svg width="34" height="34" viewBox="0 0 16 16" fill="none">
      <path d="M8 1 V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="8" cy="8" rx="4" ry="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 4 H11 M5 12 H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 13 V15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function ArtSeal() {
  return (
    <svg width="34" height="34" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 6 H10 V10 H6 Z" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

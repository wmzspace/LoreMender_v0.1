import { useEffect, useRef, useState } from "react";
import type { PageKey } from "../lib/routes";

interface QuickMenuProps {
  active?: PageKey;
  onNav: (key: PageKey) => void;
}

interface QuickItem {
  key: PageKey;
  label: string;
  desc: string;
}

/**
 * 右上角快捷菜单：把「副本进程 / 线索板 / 结局图鉴」从侧栏收进一个菜单按钮，
 * 点击展开三个选项。
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
    { key: "map", label: "副本进程", desc: "查看当前进度与节点" },
    { key: "clue", label: "线索板", desc: "已收集的线索与物证" },
    { key: "gallery", label: "结局图鉴", desc: "已解锁的结局收藏" },
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


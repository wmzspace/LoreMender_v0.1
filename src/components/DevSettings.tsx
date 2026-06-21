import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { setDevMode, useDevMode } from "../lib/devMode";
import { ConfirmModal } from "./ConfirmModal";

/** 代码尖括号图标「{'</>'}」：一看就是「开发者」，比齿轮更不容易和别的设置弄混。 */
function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M5.6 3.2 L1.6 8 L5.6 12.8 M10.4 3.2 L14.4 8 L10.4 12.8"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/** 开发者模式一行：开关 + 「?」说明 + 开启前的二次确认。 */
function DevModeRow() {
  const devMode = useDevMode();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="settings-devmode-row">
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-han)", fontSize: 14, letterSpacing: "0.18em",
        color: devMode ? "var(--gold-pale)" : "var(--paper)",
      }}>
        开发者模式
        <span className="settings-help" tabIndex={0}>
          ?
          <span className="settings-help-tip">
            开启后可在小游戏 / 探索场景里直接选定评级或结果并跳过，便于自查与调试；普通游玩无需开启。
          </span>
        </span>
      </span>
      <button
        className={"settings-toggle" + (devMode ? " is-on" : "")}
        onClick={() => { if (devMode) setDevMode(false); else setConfirmOpen(true); }}
        role="switch"
        aria-checked={devMode}
        aria-label="开发者模式"
      >
        <span className="settings-toggle-knob" />
      </button>

      {confirmOpen && createPortal(
        <ConfirmModal
          eyebrow="开 发 者 模 式"
          title="确定要开启吗？"
          text="开启后可以跳过正常的游玩节奏、直接指定关卡评级与探索结果，可能影响游戏的真实体验，仅建议自查或调试时使用。"
          confirmLabel="确 认 开 启"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setDevMode(true); setConfirmOpen(false); }}
        />,
        document.body,
      )}
    </div>
  );
}

/**
 * 设置：首页右上角齿轮图标，悬停展开面板（与音量设置同款交互），目前只有开发者模式开关。
 * placement="up" 时面板向上展开。点击仍作触屏兜底。
 */
export function DevSettings({ placement = "down" }: { placement?: "up" | "down" } = {}) {
  const [open, setOpen] = useState(false);

  const closeTimer = useRef<number>(0);
  const cancelClose = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = 0; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => cancelClose, []);

  return (
    <div
      className="sound-settings"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        className={"icon-btn press" + (open ? " is-open" : "")}
        onClick={() => setOpen(o => !o)}
        aria-label="设置"
        aria-expanded={open}
      >
        <GearIcon />
      </button>

      {open && (
        <div
          className={"sound-settings-panel" + (placement === "up" ? " is-up" : "")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sound-settings-title">设 置</div>
          <DevModeRow />
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { QUALITY_ORDER, QUALITY_LABEL, QUALITY_HINT, setQuality, useQuality } from "../lib/quality";

/** 三档递增竖条图标：一眼看出是「画质 / 等级」。 */
function GaugeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="2.6" height="5" rx="1" fill="currentColor" />
      <rect x="6.7" y="6" width="2.6" height="8" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="11.4" y="3" width="2.6" height="11" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/**
 * 画质设置：右上角图标，悬停展开面板（与音量/设置同款交互），选 极致 / 高 / 中。
 * 切换即时生效（写 <html data-quality>，CSS + 粒子层据此调整），并记住偏好。
 * placement="up" 时面板向上展开；点击作触屏兜底。
 */
export function QualitySettings({ placement = "down" }: { placement?: "up" | "down" } = {}) {
  const [open, setOpen] = useState(false);
  const quality = useQuality();

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
        aria-label="画质设置"
        aria-expanded={open}
      >
        <GaugeIcon />
      </button>

      {open && (
        <div
          className={"sound-settings-panel" + (placement === "up" ? " is-up" : "")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sound-settings-title">画 质</div>
          <div className="quality-opts">
            {QUALITY_ORDER.map(q => (
              <button
                key={q}
                className={"quality-opt press" + (quality === q ? " is-active" : "")}
                onClick={() => setQuality(q)}
                role="radio"
                aria-checked={quality === q}
              >
                <span className="quality-opt-label">{QUALITY_LABEL[q]}</span>
                <span className="quality-opt-hint">{QUALITY_HINT[q]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

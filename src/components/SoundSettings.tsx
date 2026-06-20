import { useEffect, useRef, useState } from "react";
import {
  AUDIO_CHANNELS, useAudioSettings, setChannelVolume, setChannelMuted,
  type AudioChannel,
} from "../lib/audio";

const CHANNEL_LABEL: Record<AudioChannel, string> = {
  bgm: "背景声音",
  dialogue: "对话声音",
  sfx: "系统声音",
};

/** 喇叭图标：有声 / 静音两态。 */
function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 5 H4 L7 2 V12 L4 9 H2 Z" fill="currentColor" />
      {muted ? (
        <path d="M9.5 4.5 L12.5 9.5 M12.5 4.5 L9.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      ) : (
        <>
          <path d="M9.5 4.5 C10.5 5.5 10.5 8.5 9.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <path d="M11 3 C12.5 4.5 12.5 9.5 11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

/** 单个通道：静音开关 + 音量滑块。 */
function ChannelRow({ ch }: { ch: AudioChannel }) {
  const settings = useAudioSettings();
  const { volume, muted } = settings[ch];
  const pct = Math.round(volume * 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{
          fontFamily: "var(--font-han)", fontSize: 14, letterSpacing: "0.18em",
          color: muted ? "var(--paper-shadow)" : "var(--paper)",
        }}>{CHANNEL_LABEL[ch]}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11, minWidth: 30, textAlign: "right",
            color: muted ? "var(--paper-shadow)" : "var(--gold-pale)",
            fontVariantNumeric: "tabular-nums",
          }}>{muted ? "静音" : `${pct}%`}</span>
          <button
            className="icon-btn press"
            onClick={() => setChannelMuted(ch, !muted)}
            aria-label={muted ? `开启${CHANNEL_LABEL[ch]}` : `静音${CHANNEL_LABEL[ch]}`}
            aria-pressed={muted}
            style={{ color: muted ? "var(--paper-shadow)" : "var(--gold-pale)" }}
          >
            <SpeakerIcon muted={muted} />
          </button>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          setChannelVolume(ch, v);
          // 拖动音量时自动解除静音，符合直觉
          if (muted && v > 0) setChannelMuted(ch, false);
        }}
        style={{
          width: "100%",
          accentColor: "var(--gold)",
          opacity: muted ? 0.4 : 1,
          cursor: "pointer",
        }}
      />
    </div>
  );
}

/**
 * 音量设置：悬停喇叭图标弹出面板，分别调节背景/对话/系统声音的音量与静音。
 * placement="up" 时面板向上展开（用于侧栏底部，避免溢出屏幕）。
 * 点击仍作触屏兜底。
 */
export function SoundSettings({ placement = "down" }: { placement?: "up" | "down" } = {}) {
  const [open, setOpen] = useState(false);
  const settings = useAudioSettings();
  // 任一通道静音时图标显示静音态，作为整体提示
  const anyMuted = AUDIO_CHANNELS.some(ch => settings[ch].muted);

  // 悬停展开、移开延时收缩（延时桥接按钮与面板间的间隙）。
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
        aria-label="音量设置"
        aria-expanded={open}
      >
        <SpeakerIcon muted={anyMuted} />
      </button>

      {open && (
        <div
          className={"sound-settings-panel" + (placement === "up" ? " is-up" : "")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sound-settings-title">音 量 设 置</div>
          {AUDIO_CHANNELS.map(ch => <ChannelRow key={ch} ch={ch} />)}
        </div>
      )}
    </div>
  );
}

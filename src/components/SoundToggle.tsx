import { isAudioMuted, setAudioMuted, useAudioMuted } from "../lib/audio";

/** Toggle button for all game audio — narration, BGM and sound effects (Topbar `right` slot). */
export function SoundToggle() {
  const muted = useAudioMuted();
  return (
    <button
      className="icon-btn press"
      onClick={() => setAudioMuted(!isAudioMuted())}
      aria-label={muted ? "开启声音" : "关闭声音"}
      aria-pressed={muted}
    >
      {muted ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5 H4 L7 2 V12 L4 9 H2 Z" fill="currentColor"/>
          <path d="M9.5 4.5 L12.5 9.5 M12.5 4.5 L9.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5 H4 L7 2 V12 L4 9 H2 Z" fill="currentColor"/>
          <path d="M9.5 4.5 C10.5 5.5 10.5 8.5 9.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          <path d="M11 3 C12.5 4.5 12.5 9.5 11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
      )}
    </button>
  );
}

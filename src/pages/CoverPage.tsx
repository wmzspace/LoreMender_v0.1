import { useEffect, useRef, useState, type ReactNode } from "react";
import { WorldPage } from "./WorldPage";
import { ShowcasePage } from "./ShowcasePage";

interface CoverPageProps {
  /** 进入游戏(播完开场动画后由 App 跳转到卷宗)。 */
  onStart: () => void;
}

/** 封面弹层:设定 / 档案以居中对话框呈现(带遮罩、限高),停留在封面,不进入游戏内、不暴露侧栏。 */
function CoverModal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="cover-modal-backdrop" onClick={onClose}>
      <div className="cover-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="cover-modal-close press" onClick={onClose} aria-label="关闭">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** 封面动态背景:封面图与视频交替——图停留 2.5s,再播一遍视频,如此循环。
 *  底层 cover.jpg 始终在 CoverPage 中渲染;此处视频层淡入/淡出叠加在其上。 */
const IMAGE_HOLD_MS = 1500;

function CoverVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (showVideo) {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      // muted 播放无需用户手势;失败则回到图片阶段继续循环
      v.play().catch(() => setShowVideo(false));
    } else {
      const t = window.setTimeout(() => setShowVideo(true), IMAGE_HOLD_MS);
      return () => window.clearTimeout(t);
    }
  }, [showVideo]);

  return (
    <video
      ref={videoRef}
      muted playsInline
      onEnded={() => setShowVideo(false)}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%", objectFit: "cover",
        opacity: showVideo ? 1 : 0,
        transition: "opacity 600ms ease",
        pointerEvents: "none",
      }}
    >
      <source src="/videos/cover.mp4" type="video/mp4" />
    </video>
  );
}

/** 点击「开始修补」后的全屏开场动画;播完或跳过后进入卷宗。 */
function IntroVideo({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };
  return (
    <div
      onClick={finish}
      role="button"
      aria-label="轻触以跳过动画"
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 280ms ease both",
        cursor: "pointer",
      }}
    >
      <video
        autoPlay playsInline
        onEnded={finish}
        onError={finish}
        style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
      >
        <source src="/videos/start.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: "absolute",
        bottom: "calc(34px + env(safe-area-inset-bottom,0px))",
        left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--font-han)",
        fontSize: 13,
        letterSpacing: "0.32em", textIndent: "0.32em",
        color: "rgba(236,220,166,0.78)",
        textShadow: "0 1px 8px rgba(0,0,0,0.9)",
        pointerEvents: "none",
        animation: "skipBlink 2.6s ease-in-out infinite",
      }}>轻 触 以 跳 过 动 画</div>
    </div>
  );
}

export function CoverPage({ onStart }: CoverPageProps) {
  const [playingIntro, setPlayingIntro] = useState(false);
  const [modal, setModal] = useState<null | "world" | "showcase">(null);

  // 弹层内的「进入」也走开场动画,确保动画必被看到
  const enterGame = () => { setModal(null); setPlayingIntro(true); };

  if (playingIntro) {
    return <IntroVideo onDone={onStart} />;
  }

  return (
    <div className="page night-deep-bg">
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url(/images/cover.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundColor: "#06090b",
      }} />
      <CoverVideo />
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(5,8,11,0.25) 0%, transparent 22%, transparent 48%, rgba(5,8,11,0.55) 76%, rgba(5,3,2,0.97) 100%)",
      }} />

      <div className="grain" />
      <div className="vignette" />

      <div className="en-small fade-in" style={{
        position: "absolute",
        top: "calc(20px + env(safe-area-inset-top,0px))",
        left: 26,
        zIndex: 3,
        fontSize: 10,
        letterSpacing: "0.34em",
        color: "var(--gold-pale)",
        opacity: 0.55,
        textShadow: "0 1px 6px rgba(0,0,0,0.8)",
      }}>The LOREMENDER</div>

      <div style={{
        position: "absolute",
        inset: "calc(14px + env(safe-area-inset-top,0px)) 14px calc(14px + var(--safe-bottom))",
        border: "1px solid rgba(205,178,119,0.32)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 3,
      }} />
      <div style={{
        position: "absolute",
        inset: "calc(18px + env(safe-area-inset-top,0px)) 18px calc(18px + var(--safe-bottom))",
        border: "1px solid rgba(205,178,119,0.13)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 3,
      }} />

      {/* 中央传送门:点击封面漩涡进入游戏(替代原「开始修补」按钮) */}
      <div className="cover-portal-wrap">
        <button
          className="cover-portal press"
          data-sfx="nav"
          onClick={() => setPlayingIntro(true)}
          aria-label="点击传送门，开始修补"
        >
          <span className="cover-portal-ring" aria-hidden="true" />
        </button>
        <div className="cover-portal-hint" aria-hidden="true">轻 触 漩 涡 · 开 始 修 补</div>
      </div>

      <div style={{
        position: "absolute", inset: 0,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 28px calc(40px + var(--safe-bottom))",
      }}>
        <div className="fade-up cover-actions" style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 440,
          animationDelay: "200ms",
        }}>
          <button className="btn-ghost press" onClick={() => setModal("world")}>查看设定</button>
          <button className="btn-ghost press" onClick={() => setModal("showcase")}>参赛档案</button>
        </div>
      </div>

      {modal === "world" && (
        <CoverModal onClose={() => setModal(null)}>
          <WorldPage onBack={() => setModal(null)} onEnter={enterGame} />
        </CoverModal>
      )}
      {modal === "showcase" && (
        <CoverModal onClose={() => setModal(null)}>
          <ShowcasePage onBack={() => setModal(null)} onEnter={enterGame} />
        </CoverModal>
      )}
    </div>
  );
}
